import { sliderImages } from '@/constants/slider';
import React from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function ImageSlider() {
  const ITEM_WIDTH = screenWidth * 0.75;
  const ITEM_HEIGHT = ITEM_WIDTH * 0.6;

  return (
    <View style={{ backgroundColor: '#f0f0f0', paddingVertical: 20, overflow: 'visible' }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + 20}
        decelerationRate="fast"
        contentContainerStyle={{
          paddingHorizontal: (screenWidth - ITEM_WIDTH) / 2,
        }}
        style={{
          height: ITEM_HEIGHT,
        }}
      >
        {sliderImages.map((item, index) => (
          <View key={index} style={[styles.slide, { width: ITEM_WIDTH, height: ITEM_HEIGHT, marginHorizontal: 10 }]}>
            <Image source={item} style={styles.image} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    backgroundColor: 'grey',
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    borderWidth: 2,         // largeur de la bordure
    borderColor: '#000',    // couleur de la bordure
  },
});
