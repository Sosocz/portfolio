# Site-wide local hosting

All live routes (home, on-track/Labo, off-track/Experience, calendar, projects and the two mouse demos) now reference same-origin media, CSS/runtime and documents. 170 additional original media/document files (8,245,090 bytes) were staged and sent in seven source batches before references changed. The original image pixels, srcset descriptors, card layout and animation timing are preserved. Shared/home assets are reused rather than downloaded twice.

The linked public CV PDF was mirrored to /assets/documents/CV_Sofiane_Ghazal.pdf (87,195 bytes, same PDF bytes). External profile/verification/navigation hyperlinks remain external. Source-site preconnect hints were removed from the remaining pages. The obsolete Webflow placeholder URL no longer downloads; its official generic Webflow image placeholder was mirrored as the compatible replacement, recorded with download_source in the manifest.

site-media-manifest.json records every original URL, local path and SHA-256. Static checks passed for every live route's src/srcset/stylesheets/icons/preloads/document links, shared CSS backgrounds and nested SVG references. No remote media was found in active inline scripts. Browser verification checks that real image/script/stylesheet URLs resolve to the preview origin; GPU rendering is not tested in the WebGL2-unavailable browser.
