import React from 'react';
import { View } from 'react-native';
import MapLibreGL, { Camera, MapView, PointAnnotation } from '@maplibre/maplibre-react-native';


export default function CustomMapComponents() {
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        logoEnabled={false}
        styleURL="https://tiles.openfreemap.org/styles/liberty"
      >
        <Camera
          zoomLevel={12}
          centerCoordinate={[120.9842, 14.5995]} // [Longitude, Latitude]
        />

        <PointAnnotation
          id="manilaMarker"
          coordinate={[120.9842, 14.5995]}
        >
          <View style={{
            height: 30, 
            width: 30, 
            backgroundColor: 'red', 
            borderRadius: 15, 
            borderWidth: 2, 
            borderColor: 'white' 
          }} />
        </PointAnnotation>
      </MapView>
    </View>
  );
}

function setAccessToken(arg0: null) {
  throw new Error('Function not implemented.');
}
