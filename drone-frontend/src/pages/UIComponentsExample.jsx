import React, { useState } from 'react';
import {
  Button,
  Card,
  CardTitle,
  CardDescription,
  CardContent,
  Loader,
  Modal,
  Alert,
  Toast
} from '../components/ui';

/**
 * UI Components Example Page
 * This page demonstrates all reusable UI components in the library
 */

const UIComponentsExamplePage = () => {
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModal2Open, setIsModal2Open] = useState(false);

  // State for alerts
  const [showAlert, setShowAlert] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Function to add toast notification
  const addToast = (variant) => {
    const newAlert = {
      id: Date.now(),
      variant,
      title: `${variant.charAt(0).toUpperCase() + variant.slice(1)} Notification`,
      message: 'This is an auto-dismissing toast notification',
      autoClose: 5000,
      onClose: () => removeToast(Date.now()),
    };
    setAlerts([...alerts, newAlert]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== newAlert.id));
    }, 5000);
  };

  const removeToast = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-secondary-900">
            🎨 CropMonitor UI Component Library
          </h1>
          <p className="text-lg text-secondary-600 max-w-2xl mx-auto">
            Professional, accessible, and reusable React components built with Tailwind CSS
          </p>
        </div>

        {/* Button Component Examples */}
        <Card variant="shadow">
          <CardTitle className="mb-4">Button Component</CardTitle>
          <CardDescription className="mb-6">
            Versatile buttons with multiple variants, sizes, and states
          </CardDescription>
          
          <div className="space-y-6">
            {/* Variants */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-3">Variants</h4>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="success">Success</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="outline">Outline</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-3">Sizes</h4>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="xs" variant="primary">Extra Small</Button>
                <Button size="sm" variant="primary">Small</Button>
                <Button size="md" variant="primary">Medium</Button>
                <Button size="lg" variant="primary">Large</Button>
                <Button size="xl" variant="primary">Extra Large</Button>
              </div>
            </div>

            {/* With Icons */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-3">With Icons</h4>
              <div className="flex flex-wrap gap-3">
                <Button 
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }
                >
                  Add Item
                </Button>
                <Button 
                  variant="danger"
                  rightIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  }
                >
                  Delete
                </Button>
                <Button 
                  variant="success"
                  leftIcon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  }
                >
                  Approve
                </Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-3">States</h4>
              <div className="flex flex-wrap gap-3">
                <Button loading>Loading...</Button>
                <Button disabled>Disabled</Button>
                <Button fullWidth>Full Width Button</Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Card Component Examples */}
        <Card variant="shadow">
          <CardTitle className="mb-4">Card Component</CardTitle>
          <CardDescription className="mb-6">
            Flexible card containers with headers, footers, and multiple styles
          </CardDescription>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Default Card */}
            <Card variant="default">
              <CardTitle>Default Card</CardTitle>
              <CardDescription>Simple bordered card</CardDescription>
              <CardContent className="mt-4">
                <p>This is a basic card with default styling.</p>
              </CardContent>
            </Card>

            {/* Shadow Card */}
            <Card variant="shadow">
              <CardTitle>Shadow Card</CardTitle>
              <CardDescription>Card with shadow</CardDescription>
              <CardContent className="mt-4">
                <p>This card has a nice shadow effect.</p>
              </CardContent>
            </Card>

            {/* Hover Card */}
            <Card variant="hover" hoverable>
              <CardTitle>Hover Card</CardTitle>
              <CardDescription>Interactive hover effect</CardDescription>
              <CardContent className="mt-4">
                <p>Hover over me to see the effect!</p>
              </CardContent>
            </Card>

            {/* Glass Card */}
            <Card variant="glass">
              <CardTitle>Glass Card</CardTitle>
              <CardDescription>Frosted glass effect</CardDescription>
              <CardContent className="mt-4">
                <p>Modern glassmorphism design.</p>
              </CardContent>
            </Card>

            {/* Card with Header & Footer */}
            <Card 
              header={
                <div>
                  <CardTitle>With Header</CardTitle>
                  <CardDescription>Card with header section</CardDescription>
                </div>
              }
              footer={
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost">Cancel</Button>
                  <Button size="sm">Save</Button>
                </div>
              }
            >
              <CardContent>
                <p>This card has both header and footer sections for better organization.</p>
              </CardContent>
            </Card>

            {/* Clickable Card */}
            <Card 
              onClick={() => alert('Card clicked!')}
              hoverable
            >
              <CardTitle>Clickable Card</CardTitle>
              <CardDescription>Click me!</CardDescription>
              <CardContent className="mt-4">
                <p>This entire card is clickable.</p>
              </CardContent>
            </Card>
          </div>
        </Card>

        {/* Loader Component Examples */}
        <Card variant="shadow">
          <CardTitle className="mb-4">Loader Component</CardTitle>
          <CardDescription className="mb-6">
            Loading indicators with multiple variants and sizes
          </CardDescription>

          <div className="space-y-8">
            {/* Spinner Loader */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-4">Spinner Variant</h4>
              <div className="flex flex-wrap items-center gap-8">
                <Loader variant="spinner" size="xs" />
                <Loader variant="spinner" size="sm" />
                <Loader variant="spinner" size="md" />
                <Loader variant="spinner" size="lg" />
                <Loader variant="spinner" size="xl" />
              </div>
            </div>

            {/* Dots Loader */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-4">Dots Variant</h4>
              <div className="flex flex-wrap items-center gap-8">
                <Loader variant="dots" size="sm" />
                <Loader variant="dots" size="md" />
                <Loader variant="dots" size="lg" />
              </div>
            </div>

            {/* Pulse Loader */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-4">Pulse Variant</h4>
              <div className="flex flex-wrap items-center gap-8">
                <Loader variant="pulse" size="sm" />
                <Loader variant="pulse" size="md" />
                <Loader variant="pulse" size="lg" />
              </div>
            </div>

            {/* Bars Loader */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-4">Bars Variant</h4>
              <div className="flex flex-wrap items-center gap-8">
                <Loader variant="bars" size="sm" />
                <Loader variant="bars" size="md" />
                <Loader variant="bars" size="lg" />
              </div>
            </div>

            {/* With Text */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-4">With Loading Text</h4>
              <div className="flex flex-wrap items-center gap-8">
                <Loader variant="spinner" size="md" text="Loading..." />
                <Loader variant="spinner" size="md" text="Processing..." color="success" />
                <Loader variant="dots" size="md" text="Please wait..." color="warning" />
              </div>
            </div>
          </div>
        </Card>

        {/* Modal Component Examples */}
        <Card variant="shadow">
          <CardTitle className="mb-4">Modal Component</CardTitle>
          <CardDescription className="mb-6">
            Accessible modal dialogs with different sizes
          </CardDescription>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => setIsModalOpen(true)}>
                Open Basic Modal
              </Button>
              <Button variant="success" onClick={() => setIsModal2Open(true)}>
                Open Modal with Footer
              </Button>
            </div>

            <p className="text-sm text-secondary-600">
              💡 Modals support keyboard navigation (ESC to close) and overlay clicks
            </p>
          </div>
        </Card>

        {/* Alert Component Examples */}
        <Card variant="shadow">
          <CardTitle className="mb-4">Alert Component</CardTitle>
          <CardDescription className="mb-6">
            Notification alerts with auto-dismiss and multiple variants
          </CardDescription>

          <div className="space-y-6">
            {/* Static Alerts */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-3">Alert Variants</h4>
              <div className="space-y-3">
                <Alert 
                  variant="success" 
                  title="Success!" 
                  message="Your operation completed successfully."
                />
                <Alert 
                  variant="error" 
                  title="Error" 
                  message="Something went wrong. Please try again."
                />
                <Alert 
                  variant="warning" 
                  title="Warning" 
                  message="This action cannot be undone."
                />
                <Alert 
                  variant="info" 
                  title="Information" 
                  message="Here's some helpful information for you."
                />
              </div>
            </div>

            {/* Toast Notifications */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-3">Toast Notifications</h4>
              <div className="flex flex-wrap gap-3">
                <Button onClick={() => addToast('success')} variant="success" size="sm">
                  Show Success Toast
                </Button>
                <Button onClick={() => addToast('error')} variant="danger" size="sm">
                  Show Error Toast
                </Button>
                <Button onClick={() => addToast('warning')} variant="warning" size="sm">
                  Show Warning Toast
                </Button>
                <Button onClick={() => addToast('info')} variant="secondary" size="sm">
                  Show Info Toast
                </Button>
              </div>
            </div>

            {/* Without Icon */}
            <div>
              <h4 className="text-sm font-semibold text-secondary-700 mb-3">Without Icon</h4>
              <Alert 
                variant="info" 
                icon={false}
                message="This alert has no icon"
              />
            </div>
          </div>
        </Card>

        {/* Usage Code Examples */}
        <Card variant="glass">
          <CardTitle className="mb-4">📚 Usage Examples</CardTitle>
          <CardDescription className="mb-6">
            Import and use these components in your pages
          </CardDescription>

          <div className="space-y-4 font-mono text-sm bg-secondary-900 text-green-400 p-6 rounded-lg overflow-x-auto">
            <div>
              <div className="text-secondary-400 mb-2">// Import components</div>
              <div>import &#123; Button, Card, Loader, Modal, Alert &#125; from '../components/ui';</div>
            </div>
            
            <div className="mt-4">
              <div className="text-secondary-400 mb-2">// Use in your component</div>
              <div>&lt;Button variant="primary" size="lg"&gt;Click Me&lt;/Button&gt;</div>
              <div>&lt;Card variant="shadow"&gt;...&lt;/Card&gt;</div>
              <div>&lt;Loader variant="spinner" size="md" /&gt;</div>
              <div>&lt;Alert variant="success" message="Success!" /&gt;</div>
            </div>
          </div>
        </Card>

      </div>

      {/* Modals */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Basic Modal"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            This is a basic modal with a title and content. You can close it by clicking the X button, 
            pressing ESC, or clicking outside the modal.
          </p>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isModal2Open}
        onClose={() => setIsModal2Open(false)}
        title="Modal with Footer"
        size="lg"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsModal2Open(false)}>
              Cancel
            </Button>
            <Button variant="success" onClick={() => setIsModal2Open(false)}>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <p className="text-secondary-600">
            This modal has a separate footer section for actions. The footer has a different background color.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Field Name
              </label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter value"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      {/* Toast Container */}
      <Toast alerts={alerts} position="top-right" />
    </div>
  );
};

export default UIComponentsExamplePage;
