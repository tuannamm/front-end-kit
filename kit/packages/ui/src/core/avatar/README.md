# Avatar · AvatarPicker

A person's photo, or their initials when there is no photo.

```tsx
import { Avatar, AvatarPicker } from '@dtx/ui';

<Avatar name="Nguyễn Thị Thuận" src={user.photo} />            // "NT" while the photo loads or if it fails
<AvatarPicker name={user.name} src={user.photo} onChange={file => file ? uploadPhoto(file) : removePhoto()} />
```

## Notes

- Fallback order: photo, then the initials of the first and last word (Vietnamese diacritics kept), then a person icon.
- `name` is the accessible label (`role="img"`) and the default hover title. `title=""` turns the title off.
- The navy tile with white initials is the same in both themes (`theme-fixed`).
- **AvatarPicker:** a button that opens a dialog to pick, preview, remove and save a photo. Nothing changes until
  "Lưu ảnh". `onChange` receives the `File`, or `null` when the photo was removed. Uploading is the app's job.
  The default is PNG/JPEG/WEBP up to 5 MB. The preview's object URL is revoked when the dialog closes.

## Files

- `avatar.tsx`: Avatar, AvatarPicker. Uses Button, Tooltip, Dialog and FileDropzone.
- `avatar.css`: `.dtx-avatar*`
- `initials.ts` + `initials.check.ts`: initials helper and its node check

Catalog: `#/catalog/avatar`

Props are documented in TSDoc on the types in the `.tsx`; this file covers usage and decisions only.
