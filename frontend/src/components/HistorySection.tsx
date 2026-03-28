import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { HistoryItem } from '../types/recipe';

const HISTORY_DATA: HistoryItem[] = [
  { id: '1', title: 'Wild Mushroom Pasta', cookedAgo: 'COOKED 2 DAYS AGO', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCdS4T8OyxDEu2KMNi5AS2Nzi0zq64TF-CmlXOUATB-Bh8LRiQ4gPA4qiEMr818DxYgtb-xWag0dLGFCTeC4sFZouqz2NxSiB3GC5aOx-PnZtLFEtak6TKSsujTzBSQaobryZF6x4DejxODixMt4rjsfI28FFWPaWwkmde09D58762tZ8iL8doDShN96pRtUipjSevfuZWj36MlA8sZPFs8HRPup-QPy-AhmolvDlPW0Fug8lCuLyAmZuh1Xdmi4DRaa90SgaKytiQ' },
  { id: '2', title: 'Ribeye with Asparagus', cookedAgo: 'COOKED LAST WEEK', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz9c75E1-geovKoP8ZndA0dlKncFbMbc-p0cWXIjxCh9SniYG1xM9fnqRMcJIbg7NeN1wDCVyyABLqZR68HCTIvHWvupimos5AEwQNsN4Kux92_ci8Eka4MmaxBNtEykx0PF5R_E7oomhhAvG1TCKBC-08dcruNJ3EZBbFfzqa3o0Haky6rccseAFxqRM3KfTmrlQjG9qpQ9_76F_-KyW113iK4tMth7X1brfF9el4Yufd3hWnvyofrK3ABAwCvfJxEojV7w6MOuc' },
  { id: '3', title: 'Summer Berry Salad', cookedAgo: 'COOKED 10 DAYS AGO', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBC73ng5LBcN1nR7YRXc_TvfA3CAlz4PuXYZ8C6D2PrCJGIXdFi6uMA7hyhRzknTzHW5tKdbARduTd7rNewB6FcHRxiz26Yah8fMwONktSEj4VserpxFIkaQi30bdcwfzaa16Bz9l6NK4GPdaXsOk5ADo5HIOqN1sX9UsHVmLKQQWth_PT9LymqlpeVzY9jXLq2YAeye-I3N7BytHNXRpbR1Zt--611xKFaLBjVeCQmYg0RRtqjQMrNxIJnqp6PP8VRWbUXDKmvThs' },
  { id: '4', title: 'Pesto Genovese Gnocchi', cookedAgo: 'COOKED 2 WEEKS AGO', imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqVOri6xdkaKoJQLQExn8K-kk2cLqTWels8_yHTnTye0RBEytH5GdAaw3fQeVLt55um30w_cSLTZJBvvqjhsZmZgeNy7firqIsJR7eXMdR3mWAbEieMPX-EfkExa9bnt_NGHGYnwKeh9A-pFsowUcHNPBbz2rHlbN88xuQUTuQSoisS-WjYpNmwRx63gHAfCoWWQtX_2xG-il0asKSuv6gX-ds6aLF1M8j7Pt5TQB1rn5jtCRrilwWOivhOD9ponA8uaFB3MknJHY' },
];

interface HistorySectionProps {
  onRecipePress?: (recipeId: string, recipeTitle: string) => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ onRecipePress }) => (
  <View className="mb-8">
    <View className="px-6 mb-5">
      <Text className="text-[22px] font-bold text-on-surface">Your Cooked Meals</Text>
      <Text className="text-[13px] text-outline mt-0.5">Relive your culinary successes</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
      {HISTORY_DATA.map((item) => (
        <TouchableOpacity
          key={item.id}
          className="w-[200px]"
          activeOpacity={0.85}
          onPress={() => onRecipePress?.(item.id, item.title)}
        >
          <Image
            source={{ uri: item.imageUrl }}
            className="w-[200px] h-[140px] rounded-xl mb-2.5"
            resizeMode="cover"
          />
          <Text className="text-[10px] font-bold text-primary uppercase tracking-[1px] mb-1">{item.cookedAgo}</Text>
          <Text className="text-sm font-bold text-on-surface">{item.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);
