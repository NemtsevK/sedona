/* Карта */
const mapWrapper = document.querySelector('.map__wrapper');
const mapImage = document.querySelector('.map__image');
const center = [34.866849964021355, -111.76106949186402];
const pinSize = [27, 27];
const pinOffset = [-10, -20];
const zoom = 7;

mapWrapper.classList.remove('map__wrapper--no-js');
mapImage.classList.remove('map__image--no-js');

function init() {
  let map = new ymaps.Map('map', {
    center: center,
    zoom: zoom
  });

  let placemark = new ymaps.Placemark(center, {}, {
    iconLayout: 'default#image',
    iconImageHref: 'images/sprite.svg#map-pin',
    iconImageSize: pinSize,
    iconImageOffset: pinOffset
  });

  map.controls.remove('geolocationControl');
  map.controls.remove('searchControl');
  map.controls.remove('trafficControl');
  map.controls.remove('typeSelector');
  map.controls.remove('fullscreenControl');
  map.controls.remove('zoomControl');
  map.controls.remove('rulerControl');
  map.geoObjects.add(placemark);
}

ymaps.ready(init);
