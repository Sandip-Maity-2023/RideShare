import React, { useEffect, useRef } from 'react';

const PlaceAutocomplete = ({ onPlaceSelect, placeholder = 'Search location...' }) => {
  const containerRef = useRef(null);
  const onPlaceSelectRef = useRef(onPlaceSelect);

  // Keep the callback ref updated without triggering useEffect
  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
  }, [onPlaceSelect]);

  useEffect(() => {
    let autocompleteElement;

    const initAutocomplete = async () => {
      if (!window.google?.maps) return;

      const { PlaceAutocompleteElement } = await window.google.maps.importLibrary('places');

      autocompleteElement = new PlaceAutocompleteElement();
      autocompleteElement.placeholder = placeholder;

      autocompleteElement.addEventListener('gmp-placeselect', async (event) => {
        const place = event.place;
        if (!place) return;

        try {
          // Fetch required fields
          await place.fetchFields({
            fields: ['displayName', 'formattedAddress', 'location'],
          });

          if (place.location && onPlaceSelectRef.current) {
            onPlaceSelectRef.current({
              address: place.formattedAddress,
              name: place.displayName,
              location: {
                lat: typeof place.location.lat === 'function' ? place.location.lat() : place.location.lat,
                lng: typeof place.location.lng === 'function' ? place.location.lng() : place.location.lng,
              },
              raw: place,
            });
          }
        } catch (error) {
          console.error('Error fetching place details:', error);
        }
      });

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(autocompleteElement);
      }
    };

    initAutocomplete();
  }, [placeholder]); // Only re-run if placeholder changes

  return (
    <div className="w-full text-black">
      <div ref={containerRef} className="autocomplete-container w-full" />
    </div>
  );
};

export default PlaceAutocomplete;