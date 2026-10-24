# Project showcase files

Drop your photos and videos here with these names — they appear on the site automatically:

| File | Card on the site |
|------|------------------|
| `video-01.mp4` + `video-01.jpg` (poster / first frame) | Smart key programmed on site |
| `01.jpg` | Emergency lockout |
| `02.jpg` | High-security key cutting |
| `03.jpg` | BMW — all keys lost |
| `04.jpg` | Mobile service van |
| `05.jpg` | Push-to-start fob |
| `06.jpg` | Academy training |
| `07.jpg` | Programming equipment |

Tips
- Vertical photos look best (3:4), at least 900 px wide. Compress them (e.g. squoosh.app) to under ~300 KB.
- Video: MP4 (H.264), up to ~20 MB. Longer videos — upload to YouTube and use a YouTube card instead.
- Until a file is uploaded, its card shows a "Photo coming soon" placeholder.

To change captions, add cards or use a YouTube video, edit the `PROJECT SHOWCASE`
section in `index.html` (instructions are in the comment above it). YouTube card:

```html
<button class="shot" data-type="youtube" data-src="VIDEO_ID" data-caption="Caption">
  <img src="https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg" alt="Caption" loading="lazy">
  <span class="shot__tag">Video</span><span class="shot__cap">Caption</span>
</button>
```
