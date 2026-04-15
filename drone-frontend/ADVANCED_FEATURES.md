# Advanced UI Features - CropMonitor

This document details the professional SaaS features added to enhance the CropMonitor frontend.

## 🎨 Features Implemented

### 1. Toast Notification System

**Location**: `src/components/ui/Toast.jsx`, `src/context/ToastContext.jsx`

**Features**:
- Four variants: Success, Error, Warning, Info
- Auto-dismiss with customizable duration
- Progress bar animation showing time remaining
- Multiple simultaneous toasts support
- Smooth slide-in animations
- Accessible with proper ARIA labels
- Dark mode support

**Usage**:
```javascript
import { useToast } from '../context/ToastContext';

const MyComponent = () => {
  const toast = useToast();
  
  // Show different toast types
  toast.success('Operation completed!', 'Success');
  toast.error('Something went wrong', 'Error');
  toast.warning('Please check your input', 'Warning');
  toast.info('New update available', 'Info');
};
```

**Styling**:
- Success: Green theme with checkmark icon
- Error: Red theme with X icon
- Warning: Yellow theme with exclamation icon
- Info: Blue theme with info icon

---

### 2. Dark Mode Support

**Location**: `src/context/ThemeContext.jsx`, `tailwind.config.js`, `src/index.css`

**Features**:
- System preference detection
- Manual toggle with sun/moon icon
- LocalStorage persistence
- Smooth transitions (300ms)
- Applied to all components
- Auto-detect on first visit

**Toggle Button**:
- Located in Navbar (desktop and mobile)
- Sun icon for light mode
- Moon icon for dark mode

**Dark Mode Classes Applied**:
- Background colors: `dark:bg-slate-900`
- Text colors: `dark:text-slate-100`
- Border colors: `dark:border-slate-700`
- Cards: `dark:bg-slate-800`
- Inputs: `dark:bg-slate-800/60`
- Hover states: `dark:hover:bg-slate-700`

**Custom Scrollbar**:
- Light mode: Light gray (#cbd5e1)
- Dark mode: Dark slate (#475569)

---

### 3. Circular Progress Component

**Location**: `src/components/ui/CircularProgress.jsx`

**Features**:
- SVG-based circular progress indicator
- Animated percentage display
- Color coding based on value:
  - Green: ≥80%
  - Blue: ≥60%
  - Yellow: ≥40%
  - Orange: ≥20%
  - Red: <20%
- Auto color mode (adapts color to value)
- Smooth 1-second animation on mount
- Customizable size and stroke width
- Optional center label
- Dark mode support

**Props**:
```javascript
<CircularProgress 
  value={85}              // 0-100
  size={120}              // pixel size
  strokeWidth={8}         // circle thickness
  showLabel={true}        // show percentage
  label="Confidence"      // optional text under percentage
  color="auto"            // or 'green', 'blue', 'red', etc.
  bgColor="slate"         // background circle color
/>
```

**Use Cases**:
- Confidence scores in predictions
- Upload progress
- Task completion indicators
- Health status visualization

---

### 4. Active Navigation Highlighting

**Location**: `src/components/Navbar.jsx`, `src/components/Sidebar.jsx`

**Features**:
- Automatic detection of current page using `useLocation()`
- Visual indicators:
  - **Desktop Navbar**: Green background, bottom border, green text
  - **Mobile Menu**: Green background, left border (4px), green text/icon
  - **Sidebar**: Gradient background, enhanced shadow, white text
- Smooth transitions between states
- Dark mode optimized colors

**Desktop Navigation Active State**:
- Background: `bg-green-50 dark:bg-green-900/20`
- Text: `text-green-600 dark:text-green-400`
- Border: `border-b-2 border-green-600`

**Mobile Navigation Active State**:
- Background: `bg-green-50 dark:bg-green-900/20`
- Text: `text-green-700 dark:text-green-400`
- Border: `border-l-4 border-green-600`
- Icon color matches text

**Sidebar Active State**:
- Background: `from-emerald-500 to-teal-500`
- Shadow: `shadow-lg shadow-emerald-500/25`
- Text: White

---

### 5. Smooth Animations & Transitions

**Location**: `tailwind.config.js`, `src/index.css`

**Animations Available**:

1. **Fade In**: `animate-fade-in` (0.6s)
2. **Slide In Right**: `animate-slide-in-right` (0.7s)
3. **Slide In Left**: `animate-slide-in-left` (0.7s)
4. **Scale In**: `animate-scale-in` (0.2s)
5. **Progress Bar**: `animate-progress` (duration varies)
6. **Fade In Up**: `animate-fade-in-up` (0.6s)
7. **Glow Pulse**: `animate-glow-pulse` (4s infinite)
8. **Shimmer**: `animate-shimmer` (2.5s infinite)

**Transitions Applied**:
- All theme changes: `transition-colors duration-300`
- Hover effects: `transition-all duration-200/300`
- Transform animations: `transform hover:scale-[1.02]`
- Button states: `hover:shadow-xl hover:-translate-y-0.5`

**Component-Specific Animations**:
- Toast notifications: Slide in from right
- Mobile menu: Fade in
- Modal/Dropdowns: Scale in
- Cards: Hover lift effect
- Buttons: Scale and shadow on hover

---

### 7. Enhanced Component Styling

**Updates to Existing Components**:

#### Navbar
- Added theme toggle button
- Active link highlighting
- Dark mode colors throughout
- Smooth hover states
- Mobile menu icons with conditional colors

#### Sidebar
- Dark mode support
- Already had active link styling (enhanced)
- Smooth transition animations
- Dark mode user info card

#### Cards
- `.card` and `.card-hover` classes updated
- Dark mode backgrounds
- Enhanced shadows
- Border color adjustments

#### Buttons
- `.btn-primary` with dark mode shadows
- `.btn-secondary` with dark theme
- `.btn-outline` text color fix
- Focus rings adjusted for dark mode

#### Input Fields
- `.input-field` dark backgrounds
- Placeholder text color for dark mode
- Border colors updated
- Focus states for both themes

#### Badges
- All badge variants support dark mode
- Reduced opacity backgrounds in dark
- Adjusted text colors for readability

---

### 6. PDF Export Functionality

**Location**: `src/utils/pdfExport.js`, `src/pages/Reports.jsx`

**Features**:
- Export individual reports as formatted PDF
- Export multiple reports as summary PDF
- Professional layout with CropMonitor branding
- Headers, footers, and page numbers
- Formatted report details (disease, severity, confidence)
- Treatment recommendations section
- Notes and timestamps
- Error handling with toast notifications

**Dependencies**:
- `jspdf`: PDF document generation
- `html2canvas`: HTML to canvas conversion (if needed for complex elements)

**Usage**:

```javascript
import { exportReportToPDF, exportMultipleReportsToPDF } from '../utils/pdfExport';
import { useToast } from '../context/ToastContext';

const ReportsPage = () => {
  const toast = useToast();

  // Export single report
  const handleExportReport = async (report) => {
    try {
      await exportReportToPDF(report);
      toast.success('Report exported successfully!');
    } catch (error) {
      toast.error('Failed to export report: ' + error.message);
    }
  };

  // Export multiple reports
  const handleExportAll = async (reports) => {
    try {
      await exportMultipleReportsToPDF(reports);
      toast.success(`Exported ${reports.length} reports successfully!`);
    } catch (error) {
      toast.error('Failed to export reports: ' + error.message);
    }
  };
};
```

**PDF Features**:
- **Cover Page** (multiple reports): CropMonitor logo, title, date, report count
- **Headers**: CropMonitor branding with green accent
- **Report Details**: 
  - Analyzed image reference
  - Detection results (disease name, severity, confidence)
  - Analysis timestamp
  - User information
- **Treatment Recommendations**: Formatted list of treatments
- **Notes Section**: Additional observations
- **Footers**: Page numbers and generation date
- **Styling**: Professional green color scheme (#16a34a)

**Export Locations**:
- Reports page: "Export All" button (exports all filtered reports)
- Report cards: Download icon button (exports individual report)
- Report table: Download action (exports individual report)

---

## 🎯 Integration Examples

### Using Toast Notifications

```javascript
// In any component
import { useToast } from '../context/ToastContext';

const MyComponent = () => {
  const toast = useToast();

  const handleAction = async () => {
    try {
      await someApiCall();
      toast.success('Action completed successfully!', 'Success');
    } catch (error) {
      toast.error(error.message, 'Operation Failed');
    }
  };
  
  return <button onClick={handleAction}>Do Action</button>;
};
```

### Using Circular Progress

```javascript
import CircularProgress from '../components/ui/CircularProgress';

const MyComponent = ({ confidence }) => {
  return (
    <div>
      <CircularProgress 
        value={confidence * 100} 
        color="auto"
        label="Confidence"
      />
    </div>
  );
};
```

### Using Theme Toggle

```javascript
// Theme is global - the toggle in Navbar works automatically
// Access theme state anywhere:
import { useTheme } from '../context/ThemeContext';

const MyComponent = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div>
      Current theme: {theme}
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
};
```

---

## 🛠️ Configuration

### Tailwind Config
- Dark mode: `class` strategy
- Custom animations added
- Progress keyframe animation

### Context Providers Order

In `App.js`:
```javascript
<ThemeProvider>
  <AuthProvider>
    <ToastProvider>
      <AppLayout />
    </ToastProvider>
  </AuthProvider>
</ThemeProvider>
```

---

## 📱 Responsive Behavior

All features are fully responsive:

- **Toast**: Fixed position, stacks vertically, mobile-optimized width
- **Dark Mode**: Works seamlessly across all breakpoints
- **Circular Progress**: Scales with container, text size adjusts
- **Active Navigation**: Different styling for desktop/mobile
- **Animations**: Performance-optimized for mobile devices

---

## ♿ Accessibility

- **Toast**: ARIA roles, keyboard-accessible close button
- **Theme Toggle**: Proper `aria-label` attributes
- **Navigation**: Focus states with visible rings
- **Circular Progress**: Semantic HTML, readable labels
- **Color Contrast**: WCAG AA compliant in both themes

---

## 🎨 Color Palette

### Light Mode
- Primary: Green-600 (#16a34a)
- Background: Slate-50 (#f8fafc)
- Text: Slate-900 (#0f172a)
- Cards: White (#ffffff)

### Dark Mode
- Primary: Green-400 (#4ade80)
- Background: Slate-900 (#0f172a)
- Text: Slate-100 (#f1f5f9)
- Cards: Slate-800 (#1e293b)

---

## 🚀 Performance

- **Theme switching**: Instant with CSS class toggle
- **Animations**: GPU-accelerated transforms
- **Toast system**: Efficient state management
- **Dark mode**: No flash on page load
- **Circular progress**: SVG-based (lightweight)

---

## 📚 Future Enhancements

Potential additions for further improvements:

1. **Skeleton Loaders**: Loading states for better UX
2. **Micro-interactions**: More subtle hover effects
3. **Theme Customization**: User-defined color schemes
4. **Toast Sounds**: Optional audio feedback
5. **Keyboard Shortcuts**: Quick access to common actions
6. **Breadcrumbs**: Navigation trail for nested pages

---

## 🐛 Known Issues

None at this time. All features tested and working correctly.

---

## 📝 Notes

- All components follow mobile-first responsive design
- Dark mode persists across sessions via localStorage
- Toast notifications auto-dismiss after 5 seconds (configurable)
- Active navigation detection uses React Router's `useLocation()`
- Circular progress animates on mount with 1s duration

---

**Last Updated**: January 2025
**Version**: 1.0.0
