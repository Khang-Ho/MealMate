import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface AIAnalysisCardProps {
  bodyText?: string;
  healthScore?: number;
  wasteSaved?: string;
}

export const AIAnalysisCard: React.FC<AIAnalysisCardProps> = ({
  bodyText = "Based on your current inventory, this recipe uses 85% of items nearing their expiration date. We've matched the lemon and dill you bought 4 days ago with high-protein salmon to maximize nutrition while minimizing waste.",
  healthScore = 9.2,
  wasteSaved = '420g',
}) => (
  <View className="rounded-[20px] p-6 overflow-hidden" style={{ backgroundColor: 'rgba(0,88,188,0.05)' }}>
    {/* Watermark */}
    <View className="absolute top-2 right-2 opacity-[0.15]" pointerEvents="none">
      <MaterialIcons name="psychology" size={80} color="rgba(0,88,188,0.1)" />
    </View>

    <View className="flex-row items-center gap-2.5 mb-4">
      <MaterialIcons name="auto-awesome" size={20} color="#0058bc" />
      <Text className="text-[22px] font-extrabold text-on-surface">Why this recipe?</Text>
    </View>

    <Text className="text-[15px] text-on-surface-variant leading-6 mb-5">{bodyText}</Text>

    <View className="flex-row gap-3">
      {[
        { label: 'Health Score', value: healthScore.toFixed(1), labelClass: 'text-secondary' },
        { label: 'Waste Saved', value: wasteSaved, labelClass: 'text-primary' },
      ].map((stat) => (
        <View
          key={stat.label}
          className="flex-1 bg-surface-container-lowest rounded-[14px] p-4"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}
        >
          <Text className={`text-[10px] font-bold uppercase tracking-[0.5px] mb-1 ${stat.labelClass}`}>
            {stat.label}
          </Text>
          <Text className="text-[28px] font-black text-on-surface">{stat.value}</Text>
        </View>
      ))}
    </View>
  </View>
);
