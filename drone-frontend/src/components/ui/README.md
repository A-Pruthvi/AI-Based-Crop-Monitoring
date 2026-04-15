# 🎨 CropMonitor UI Component Library

A professional, accessible, and fully customizable React component library built with Tailwind CSS for the CropMonitor application.

## 📦 Components Overview

- **Button** - Versatile button with 7 variants, 5 sizes, loading states, and icon support
- **Card** - Flexible container with header/footer support and 5 style variants
- **Loader** - Loading indicators with 4 animation types
- **Modal** - Accessible modal dialogs with keyboard navigation
- **Alert** - Notification system with auto-dismiss and toast support

---

## 🚀 Quick Start

### Installation
All components are already included in `src/components/ui/`. No additional installation required.

### Import Components

```jsx
// Import individual components
import { Button, Card, Loader, Modal, Alert } from '../components/ui';

// Import sub-components
import { Card, CardTitle, CardDescription, CardContent } from '../components/ui';
import { Alert, Toast } from '../components/ui';
```

### Basic Usage

```jsx
function MyComponent() {
  return (
    <>
      <Button variant="primary" size="lg">Click Me</Button>
      <Card variant="shadow">
        <CardTitle>My Card</CardTitle>
        <CardContent>Content here</CardContent>
      </Card>
      <Loader variant="spinner" />
      <Alert variant="success" message="Operation successful!" />
    </>
  );
}
```

---

## 📖 Component Documentation

### Button Component

Versatile button component with multiple variants, sizes, and states.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'primary'` | Button style: `primary`, `secondary`, `success`, `danger`, `warning`, `ghost`, `outline` |
| `size` | `string` | `'md'` | Button size: `xs`, `sm`, `md`, `lg`, `xl` |
| `fullWidth` | `boolean` | `false` | Makes button full width |
| `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `boolean` | `false` | Shows loading spinner |
| `leftIcon` | `ReactNode` | - | Icon to display on the left |
| `rightIcon` | `ReactNode` | - | Icon to display on the right |
| `onClick` | `function` | - | Click handler |
| `className` | `string` | - | Additional CSS classes |

#### Examples

```jsx
// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>
<Button variant="warning">Warning</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>

// With Icons
<Button 
  leftIcon={<PlusIcon />}
>
  Add Item
</Button>

<Button 
  rightIcon={<ArrowRightIcon />}
  variant="success"
>
  Continue
</Button>

// States
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
<Button fullWidth>Full Width Button</Button>
```

---

### Card Component

Flexible card container with header, footer, and multiple style variants.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'default'` | Card style: `default`, `bordered`, `shadow`, `hover`, `glass` |
| `hoverable` | `boolean` | `false` | Enables hover effect |
| `onClick` | `function` | - | Makes card clickable |
| `header` | `ReactNode` | - | Header content |
| `footer` | `ReactNode` | - | Footer content |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Card content |

#### Sub-Components

- `CardTitle` - Styled title component
- `CardDescription` - Styled description component
- `CardContent` - Content wrapper

#### Examples

```jsx
// Basic Card
<Card variant="shadow">
  <CardTitle>Card Title</CardTitle>
  <CardDescription>Card description goes here</CardDescription>
  <CardContent>
    <p>Main content</p>
  </CardContent>
</Card>

// Card with Header & Footer
<Card
  header={
    <div>
      <CardTitle>Title</CardTitle>
      <CardDescription>Description</CardDescription>
    </div>
  }
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="ghost">Cancel</Button>
      <Button>Save</Button>
    </div>
  }
>
  <CardContent>
    Form fields or content here
  </CardContent>
</Card>

// Clickable Card
<Card 
  onClick={() => navigate('/details')}
  hoverable
>
  <CardTitle>Click Me</CardTitle>
</Card>

// Glass Effect Card
<Card variant="glass">
  <CardTitle>Glassmorphism</CardTitle>
</Card>
```

---

### Loader Component

Loading indicators with multiple animation variants.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'spinner'` | Animation type: `spinner`, `dots`, `pulse`, `bars` |
| `size` | `string` | `'md'` | Loader size: `xs`, `sm`, `md`, `lg`, `xl` |
| `color` | `string` | `'primary'` | Color: `primary`, `secondary`, `success`, `danger`, `warning` |
| `fullScreen` | `boolean` | `false` | Shows loader as full-screen overlay |
| `text` | `string` | - | Loading text to display |
| `className` | `string` | - | Additional CSS classes |

#### Examples

```jsx
// Variants
<Loader variant="spinner" />
<Loader variant="dots" />
<Loader variant="pulse" />
<Loader variant="bars" />

// Sizes
<Loader variant="spinner" size="sm" />
<Loader variant="spinner" size="md" />
<Loader variant="spinner" size="lg" />

// With Text
<Loader variant="spinner" text="Loading..." />
<Loader variant="dots" text="Processing..." color="success" />

// Full Screen
<Loader variant="spinner" fullScreen text="Please wait..." />

// Colors
<Loader variant="spinner" color="primary" />
<Loader variant="spinner" color="success" />
<Loader variant="spinner" color="danger" />
```

---

### Modal Component

Accessible modal dialog with keyboard navigation and overlay click support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Controls modal visibility |
| `onClose` | `function` | - | Close handler (required) |
| `title` | `string` | - | Modal title |
| `size` | `string` | `'md'` | Modal size: `xs`, `sm`, `md`, `lg`, `xl` |
| `closeOnOverlay` | `boolean` | `true` | Close on overlay click |
| `closeOnEsc` | `boolean` | `true` | Close on ESC key |
| `footer` | `ReactNode` | - | Footer content |
| `className` | `string` | - | Additional CSS classes |
| `children` | `ReactNode` | - | Modal content |

#### Examples

```jsx
// Basic Modal
const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
>
  <p>Are you sure you want to proceed?</p>
  <div className="flex justify-end gap-2 mt-4">
    <Button variant="ghost" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button onClick={handleConfirm}>
      Confirm
    </Button>
  </div>
</Modal>

// Modal with Footer
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Edit Profile"
  size="lg"
  footer={
    <div className="flex justify-end gap-2">
      <Button variant="ghost" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button variant="success" onClick={handleSave}>
        Save Changes
      </Button>
    </div>
  }
>
  <form>
    {/* Form fields */}
  </form>
</Modal>

// Large Modal
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Terms and Conditions"
  size="xl"
>
  <div className="prose">
    {/* Long content */}
  </div>
</Modal>
```

---

### Alert Component

Notification alerts with auto-dismiss functionality and toast support.

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `string` | `'info'` | Alert type: `success`, `error`, `warning`, `info` |
| `title` | `string` | - | Alert title |
| `message` | `string` | - | Alert message |
| `icon` | `boolean` | `true` | Show/hide icon |
| `dismissible` | `boolean` | `true` | Show close button |
| `onClose` | `function` | - | Close handler |
| `autoClose` | `number` | - | Auto-dismiss after ms |
| `className` | `string` | - | Additional CSS classes |

#### Toast Component

For displaying stacked toast notifications.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `alerts` | `array` | `[]` | Array of alert objects |
| `position` | `string` | `'top-right'` | Position: `top-right`, `top-left`, `bottom-right`, `bottom-left` |

#### Examples

```jsx
// Static Alerts
<Alert 
  variant="success" 
  title="Success!" 
  message="Your changes have been saved."
/>

<Alert 
  variant="error" 
  title="Error" 
  message="Something went wrong."
/>

<Alert 
  variant="warning" 
  title="Warning" 
  message="This action cannot be undone."
/>

<Alert 
  variant="info" 
  title="Information" 
  message="Here's some helpful info."
/>

// Auto-dismiss Alert
<Alert 
  variant="success" 
  message="Saved successfully!"
  autoClose={3000}
  onClose={() => console.log('Closed')}
/>

// Without Icon
<Alert 
  variant="info" 
  message="Simple message"
  icon={false}
/>

// Toast Notifications
const [alerts, setAlerts] = useState([]);

const addToast = (variant, message) => {
  const newAlert = {
    id: Date.now(),
    variant,
    title: `${variant.charAt(0).toUpperCase() + variant.slice(1)}`,
    message,
    autoClose: 5000,
    onClose: () => removeToast(Date.now())
  };
  setAlerts([...alerts, newAlert]);
};

const removeToast = (id) => {
  setAlerts(alerts.filter(alert => alert.id !== id));
};

<Toast alerts={alerts} position="top-right" />
<Button onClick={() => addToast('success', 'Operation completed!')}>
  Show Toast
</Button>
```

---

## 🎨 Styling & Customization

### Tailwind Configuration

All components use Tailwind CSS utility classes. The color palette is defined in `tailwind.config.js`:

- **Primary**: Green shades (success, nature)
- **Secondary**: Slate/gray shades (neutral)
- **Accent**: Yellow/amber shades (highlights)

### Custom Classes

You can add custom classes via the `className` prop on any component:

```jsx
<Button className="mt-4 shadow-lg">Custom Button</Button>
<Card className="border-2 border-primary-500">Custom Card</Card>
```

### Animations

Components use these animations (defined in `tailwind.config.js`):

- `fade-in` - Fade in effect
- `scale-in` - Scale up effect
- `slide-in-right` - Slide from right
- Plus various spinner and pulse animations

---

## ♿ Accessibility

All components follow WCAG 2.1 Level AA guidelines:

- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Escape)
- **ARIA Labels**: Proper ARIA attributes for screen readers
- **Focus Management**: Clear focus indicators
- **Color Contrast**: Meets WCAG contrast ratios

### Modal Accessibility
- Traps focus inside modal when open
- ESC key to close
- Proper ARIA role and labels

### Button Accessibility
- Disabled state properly communicated
- Loading state with aria-busy

### Alert Accessibility
- Proper role="alert" for screen readers
- Color-independent iconography

---

## 📱 Responsive Design

All components are fully responsive:

- **Mobile-first**: Optimized for small screens
- **Breakpoints**: `sm`, `md`, `lg`, `xl`, `2xl`
- **Touch-friendly**: Adequate tap targets (min 44px)

---

## 🔧 Best Practices

### Performance
- Use `fullScreen` Loader sparingly (blocks UI)
- Limit concurrent Toast notifications (3-5 max)
- Memoize callbacks passed to components

### User Experience
- Use appropriate button variants (danger for destructive actions)
- Provide loading feedback for async operations
- Use auto-dismiss for success messages
- Keep modal content concise

### Code Organization
```jsx
// ✅ Good - Import from index
import { Button, Card, Alert } from '../components/ui';

// ❌ Avoid - Direct imports
import Button from '../components/ui/Button';
```

---

## 📁 File Structure

```
src/
└── components/
    └── ui/
        ├── index.js           # Barrel exports
        ├── Button.jsx         # Button component
        ├── Card.jsx           # Card component
        ├── Loader.jsx         # Loader component
        ├── Modal.jsx          # Modal component
        └── Alert.jsx          # Alert component
```

---

## 🧪 Example Page

View all components in action:

```bash
# Navigate to the example page component
src/pages/UIComponentsExample.jsx
```

To add the example page to your app routes:

```jsx
// In AppRoutes.jsx or similar
import UIComponentsExample from '../pages/UIComponentsExample';

<Route path="/ui-examples" element={<UIComponentsExample />} />
```

---

## 🐛 Troubleshooting

### Styles not applying
- Ensure Tailwind CSS is properly configured
- Check `tailwind.config.js` content array includes your files
- Verify animations are defined in config

### Modal not closing
- Ensure `onClose` function updates state
- Check if `closeOnOverlay` or `closeOnEsc` props are set to false

### Toast notifications stacking incorrectly
- Verify each alert has a unique `id`
- Check `position` prop on Toast component

---

## 🚧 Future Enhancements

Potential additions to the component library:

- **Form Components**: Input, Select, Checkbox, Radio
- **Table**: Sortable data table with pagination
- **Dropdown**: Context menus and select dropdowns
- **Tabs**: Tab navigation component
- **Badge**: Status badges and tags
- **Avatar**: User avatar component
- **Tooltip**: Hover tooltips
- **Progress**: Progress bars and steppers

---

## 📝 License

Part of the CropMonitor project. All rights reserved.

---

## 🤝 Contributing

When adding new components:

1. Follow existing patterns and prop naming conventions
2. Include PropTypes or TypeScript types
3. Ensure accessibility (ARIA, keyboard nav)
4. Document all props and provide examples
5. Test on multiple screen sizes
6. Update this README

---

## 💡 Tips

- **Combine Components**: Use components together for rich UIs
- **Consistent Variants**: Stick to variant names across your app
- **Loading States**: Always show feedback for async operations
- **Error Handling**: Use error variant alerts for form validation
- **User Feedback**: Provide clear success/error messages

---

**Built with ❤️ for CropMonitor - Drone-based Crop Disease Detection System**
