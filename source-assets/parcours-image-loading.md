# CV image delivery

The eight home parcours cards use eager loading and same-origin image preloads rather than lazy+low priority, which can wait for horizontally transformed cards to approach the viewport. SVG logos are unchanged and retain their original colors and dimensions.

School photograph variants preserve the original 3:2 canvas, at WebP quality 88: 360px/22,416 bytes, 640px/61,422 bytes, 960px/135,438 bytes. The 199KB original remains untouched. Matching imagesrcset/imagesizes on the preload prevents downloading a different size before the image. Sizes follow the image's existing 76% width inside the card: 50vw mobile/tablet, 65.48vh desktop.
