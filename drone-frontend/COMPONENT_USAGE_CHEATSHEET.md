# 🚀 UI Components Quick Reference

Quick cheat sheet for CropMonitor UI components. For full documentation, see [README.md](./README.md).

---

## 📦 Import

```jsx
import { Button, Card, CardTitle, CardDescription, CardContent, Loader, Modal, Alert, Toast } from '../components/ui';
```

---

## 🔘 Button

```jsx
// Basic
<Button>Click Me</Button>

// Variants: primary | secondary | success | danger | warning | ghost | outline
<Button variant="danger">Delete</Button>

// Sizes: xs | sm | md | lg | xl
<Button size="lg">Large Button</Button>

// States
<Button loading>Saving...</Button>
<Button disabled>Can't Click</Button>
<Button fullWidth>Full Width</Button>

// With Icons
<Button leftIcon={<PlusIcon />}>Add</Button>
<Button rightIcon={<ArrowIcon />}>Next</Button>
```

---

## 📄 Card

```jsx
// Basic
<Card>
  <CardTitle>Title</CardTitle>
  <CardDescription>Description</CardDescription>
  <CardContent>Content here</CardContent>
</Card>

// Variants: default | bordered | shadow | hover | glass
<Card variant="shadow">...</Card>

// With Header & Footer
<Card
  header={<CardTitle>Header</CardTitle>}
  footer={<Button>Action</Button>}
>
  Content
</Card>

// Clickable
<Card onClick={() => {}} hoverable>...</Card>
```

---

## ⏳ Loader

```jsx
// Variants: spinner | dots | pulse | bars
<Loader variant="spinner" />
<Loader variant="dots" />

// Sizes: xs | sm | md | lg | xl
<Loader size="lg" />

// With Text
<Loader variant="spinner" text="Loading..." />

// Colors: primary | secondary | success | danger | warning
<Loader color="success" />

// Full Screen
<Loader variant="spinner" fullScreen text="Please wait..." />
```

---

## 🪟 Modal

```jsx
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Modal Title"
  size="md"  // xs | sm | md | lg | xl
>
  <p>Modal content here</p>
  <div className="flex justify-end gap-2 mt-4">
    <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
    <Button onClick={handleSave}>Save</Button>
  </div>
</Modal>

// With Footer
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Form"
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      <Button onClick={onSave}>Save</Button>
    </div>
  }
>
  Form fields here
</Modal>
```

---

## 🔔 Alert & Toast

```jsx
// Static Alert
// Variants: success | error | warning | info
<Alert variant="success" title="Success!" message="Operation completed." />
<Alert variant="error" title="Error" message="Something went wrong." />

// Auto-dismiss
<Alert 
  variant="success" 
  message="Saved!"
  autoClose={3000}
  onClose={() => console.log('closed')}
/>

// Without Icon
<Alert variant="info" message="Message" icon={false} />

// Toast Notifications
const [alerts, setAlerts] = useState([]);

const showToast = (variant, message) => {
  const newAlert = {
    id: Date.now(),
    variant,
    title: 'Notification',
    message,
    autoClose: 5000,
    onClose: () => setAlerts(alerts.filter(a => a.id !== newAlert.id))
  };
  setAlerts([...alerts, newAlert]);
};

<Toast alerts={alerts} position="top-right" />
<Button onClick={() => showToast('success', 'Done!')}>Show Toast</Button>
```

---

## 🎨 Common Patterns

### Form with Card & Button
```jsx
<Card variant="shadow">
  <CardTitle>User Information</CardTitle>
  <CardDescription>Update your profile details</CardDescription>
  <CardContent>
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" type="button">Cancel</Button>
        <Button variant="success" type="submit" loading={isSubmitting}>
          Save Changes
        </Button>
      </div>
    </form>
  </CardContent>
</Card>
```

### Delete Confirmation Modal
```jsx
<Modal
  isOpen={showDeleteModal}
  onClose={() => setShowDeleteModal(false)}
  title="Confirm Deletion"
  size="sm"
>
  <Alert variant="warning" message="This action cannot be undone." />
  <p className="mt-4 text-secondary-600">
    Are you sure you want to delete this item?
  </p>
  <div className="flex justify-end gap-2 mt-6">
    <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </div>
</Modal>
```

### Loading State
```jsx
{isLoading ? (
  <Loader variant="spinner" text="Loading data..." />
) : (
  <Card>
    {/* Content */}
  </Card>
)}
```

### Action Buttons Row
```jsx
<div className="flex flex-wrap gap-3">
  <Button 
    variant="success" 
    leftIcon={<CheckIcon />}
  >
    Approve
  </Button>
  <Button 
    variant="danger" 
    leftIcon={<XIcon />}
  >
    Reject
  </Button>
  <Button 
    variant="ghost"
  >
    View Details
  </Button>
</div>
```

### Card Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card variant="hover" hoverable onClick={() => navigate('/item1')}>
    <CardTitle>Item 1</CardTitle>
    <CardContent>Description</CardContent>
  </Card>
  <Card variant="hover" hoverable onClick={() => navigate('/item2')}>
    <CardTitle>Item 2</CardTitle>
    <CardContent>Description</CardContent>
  </Card>
  <Card variant="hover" hoverable onClick={() => navigate('/item3')}>
    <CardTitle>Item 3</CardTitle>
    <CardContent>Description</CardContent>
  </Card>
</div>
```

---

## 🎯 Quick Tips

- ✅ Use `variant="danger"` for destructive actions
- ✅ Show `loading` state on buttons during async operations
- ✅ Use `autoClose` on success alerts (3-5 seconds)
- ✅ Keep error alerts dismissible (no autoClose)
- ✅ Limit toast notifications to 3-5 visible at once
- ✅ Use `fullScreen` loader for critical blocking operations
- ✅ Add hover effects with `hoverable` prop on cards
- ✅ Use `fullWidth` buttons in mobile/narrow containers

---

## 🔍 Props Quick Reference

| Component | Key Props | Values |
|-----------|-----------|--------|
| **Button** | variant | primary, secondary, success, danger, warning, ghost, outline |
| | size | xs, sm, md, lg, xl |
| | loading | true/false |
| **Card** | variant | default, bordered, shadow, hover, glass |
| | hoverable | true/false |
| **Loader** | variant | spinner, dots, pulse, bars |
| | size | xs, sm, md, lg, xl |
| | fullScreen | true/false |
| **Modal** | size | xs, sm, md, lg, xl |
| | closeOnOverlay | true/false |
| | closeOnEsc | true/false |
| **Alert** | variant | success, error, warning, info |
| | autoClose | milliseconds |
| | dismissible | true/false |

---

## 📱 Responsive Classes

Use Tailwind responsive prefixes with components:

```jsx
<Button className="w-full md:w-auto">Responsive Button</Button>
<Card className="p-4 md:p-6 lg:p-8">Responsive Padding</Card>
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

---

## 🐛 Common Issues

**Styles not showing?**
- Run `npm install` after updating package.json
- Restart dev server

**Modal not closing?**
- Check `onClose` updates state correctly
- Verify `isOpen` prop is controlled

**Animations not working?**
- Ensure `tailwind.config.js` includes animations
- Check `animate-*` classes are defined

---

**Full Documentation**: See [README.md](./README.md) for complete props list and examples.

**Example Page**: Check `src/pages/UIComponentsExample.jsx` to see all components in action.
