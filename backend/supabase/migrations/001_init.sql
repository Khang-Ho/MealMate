-- MealMate — initial schema
-- Run this in Supabase SQL editor (Dashboard → SQL Editor → New Query)

-- ─────────────────────────────────────────────────
-- 1. Saved recipes (bookmarked by user)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_recipes (
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          TEXT        NOT NULL,          -- Clerk user ID
    spoonacular_id   INTEGER     NOT NULL,
    title            TEXT        NOT NULL,
    image            TEXT,
    ready_minutes    INTEGER,
    servings         INTEGER,
    saved_at         TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, spoonacular_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_recipes_user ON saved_recipes (user_id);

-- ─────────────────────────────────────────────────
-- 2. User pantry — ingredients the user already has
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pantry_items (
    id              UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         TEXT        NOT NULL,
    name            TEXT        NOT NULL,           -- normalised lower-case name
    quantity        TEXT,
    unit            TEXT,
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_pantry_user ON pantry_items (user_id);

-- ─────────────────────────────────────────────────
-- 3. Shopping list — ingredients user needs to buy
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shopping_list (
    id                  UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id             TEXT        NOT NULL,
    spoonacular_id      INTEGER,                    -- which recipe this item belongs to
    recipe_title        TEXT,
    ingredient_name     TEXT        NOT NULL,
    original_string     TEXT,                       -- raw Spoonacular text e.g. "2 cups flour"
    amount              NUMERIC,
    unit                TEXT,
    is_checked          BOOLEAN     DEFAULT FALSE,
    added_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shopping_user ON shopping_list (user_id);
CREATE INDEX IF NOT EXISTS idx_shopping_recipe ON shopping_list (user_id, spoonacular_id);

-- ─────────────────────────────────────────────────
-- 4. Cooked meals — history of meals user has cooked
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cooked_meals (
    id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          TEXT        NOT NULL,
    spoonacular_id   INTEGER     NOT NULL,
    title            TEXT        NOT NULL,
    image            TEXT,
    cooked_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cooked_meals_user ON cooked_meals (user_id);
CREATE INDEX IF NOT EXISTS idx_cooked_meals_user_time ON cooked_meals (user_id, cooked_at DESC);

-- ─────────────────────────────────────────────────
-- 5. Recipe search cache (optional, reduces API calls)
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS recipe_cache (
    spoonacular_id  INTEGER     PRIMARY KEY,
    title           TEXT        NOT NULL,
    image           TEXT,
    ready_minutes   INTEGER,
    servings        INTEGER,
    cuisines        TEXT[],
    diets           TEXT[],
    summary         TEXT,
    ingredients     JSONB,      -- array of {name, amount, unit, original}
    cached_at       TIMESTAMPTZ DEFAULT NOW()
);
