# OPTIMUS - Event Management Platform

## Project Overview

**OPTIMUS** is a comprehensive event management platform built with Next.js 16, TypeScript, and Supabase. It enables users to discover, host, register for, and manage events with features including dynamic form building, payment processing, QR code ticketing, and admin dashboards.

---

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Email/Password + Google OAuth)
- **Payment Gateway**: Razorpay
- **UI Components**: Radix UI + Tailwind CSS
- **Form Management**: React Hook Form
- **QR Code**: html5-qrcode, react-qr-code
- **Email**: Nodemailer
- **State Management**: React Context API

---

## Project Structure

```
optimus-org/
├── src/
│   ├── app/                          # Next.js App Router pages
│   │   ├── admin-dashboard/          # Admin panel
│   │   │   └── [user_id]/
│   │   │       ├── events/           # Admin event management
│   │   │       ├── organisation/    # Organization management
│   │   │       ├── profiles/         # User profile management
│   │   │       └── recruitment/     # Recruitment applications
│   │   ├── api/                      # API routes
│   │   │   ├── create-order/         # Razorpay order creation
│   │   │   └── send-email/           # Email sending utilities
│   │   ├── auth/                     # Authentication pages
│   │   │   └── callback/             # OAuth callback handler
│   │   ├── dashboard/                # User dashboard
│   │   │   └── [user_id]/
│   │   │       └── eventmanage/     # Event management
│   │   ├── event-page/               # Event browsing & details
│   │   │   ├── [id]/
│   │   │   │   ├── builder/         # Dynamic form builder
│   │   │   │   └── register/        # Event registration
│   │   │   └── event-details/        # Event detail view
│   │   ├── form/                     # Form pages
│   │   │   ├── create-event/        # Event creation form
│   │   │   ├── joinus/              # Join organization form
│   │   │   ├── organisation-register/ # Organization registration
│   │   │   └── organisation-edit/   # Organization editing
│   │   ├── checked_in/               # Check-in page
│   │   ├── home/                     # Landing page
│   │   ├── payment/                  # Payment processing
│   │   ├── posts/                    # Blog/social posts
│   │   └── reset-password/           # Password reset
│   ├── components/                   # React components
│   │   ├── admin-dashboard/         # Admin UI components
│   │   │   ├── CRUDForm.tsx         # Generic CRUD operations
│   │   │   ├── DataTable.tsx        # Data table component
│   │   │   ├── ExportButton.tsx    # Data export functionality
│   │   │   ├── OrganizationForm.tsx # Organization form
│   │   │   ├── ProfileForm.tsx      # Profile management form
│   │   │   ├── RecruitmentForm.tsx  # Recruitment form
│   │   │   └── sidebar.tsx          # Admin sidebar navigation
│   │   ├── auth/                     # Authentication components
│   │   │   ├── Auth.tsx             # Auth wrapper component
│   │   │   ├── Login.tsx            # Login form
│   │   │   ├── Signup.tsx           # Signup form
│   │   │   └── ForgotPassword.tsx   # Password recovery
│   │   ├── dashboard/                # Dashboard components
│   │   │   ├── EventStatsGrid.tsx   # Event statistics
│   │   │   ├── HostedEventsList.tsx # Hosted events list
│   │   │   ├── ParticipatedEventsList.tsx # Participated events
│   │   │   ├── HostedPostsList.tsx  # User posts list
│   │   │   ├── OrganizationBox.tsx  # Organization info box
│   │   │   ├── UpcomingEventBox.tsx # Upcoming events widget
│   │   │   └── hostevent/           # Event hosting components
│   │   │       ├── EventEditForm.tsx      # Edit event form
│   │   │       ├── EventFormBuilder.tsx  # Dynamic form builder
│   │   │       └── EventRegistrationsView.tsx # View registrations
│   │   ├── form/                     # Form components
│   │   │   ├── DynamicEventForm.tsx # Dynamic registration form
│   │   │   ├── DynamicFormBuilder.tsx # Form builder UI
│   │   │   └── profilesetting/      # Profile settings
│   │   ├── navbar/                   # Navigation components
│   │   ├── posts/                    # Post components
│   │   ├── ticket/                   # Ticket components
│   │   │   └── TicketScanner.tsx    # QR code scanner
│   │   └── ui/                       # Reusable UI components (shadcn/ui)
│   ├── api/                          # API client
│   │   └── client.js                 # Supabase client
│   ├── lib/                          # Utility libraries
│   │   ├── types/                    # TypeScript type definitions
│   │   │   ├── event.ts             # Event-related types
│   │   │   ├── form.ts              # Form types
│   │   │   ├── recruitment.ts       # Recruitment types
│   │   │   └── supabase.ts          # Database types
│   │   ├── dynamicForm.ts           # Dynamic form utilities
│   │   ├── email.ts                  # Email utilities
│   │   ├── formBuilder.ts           # Form builder logic
│   │   └── utils.ts                  # General utilities
│   ├── context/                      # React Context providers
│   │   └── UserContext.tsx          # User context
│   └── hooks/                        # Custom React hooks
│       ├── useAuth.tsx               # Authentication hook
│       └── use-toast.ts             # Toast notification hook
├── public/                           # Static assets
├── package.json                      # Dependencies
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
└── components.json                   # shadcn/ui configuration
```

---

## Core Functionalities

### 1. **Authentication & Authorization**
- **Email/Password Authentication**: Traditional login/signup
- **Google OAuth**: Social login integration
- **Password Recovery**: Forgot password functionality
- **Role-Based Access**: Admin, Organizer, User roles
- **Session Management**: Supabase Auth session handling

### 2. **Event Management**

#### **For Event Organizers:**
- **Create Events**: Comprehensive event creation form
  - Title, description, category
  - Date/time, location
  - Ticket pricing (free/paid)
  - Banner image upload
  - Contact information
  - Max participants limit
- **Dynamic Form Builder**: Create custom registration forms
  - Text, email, number fields
  - Dropdown/select fields
  - Checkbox fields
  - Payment fields
  - Required/optional field configuration
- **Event Editing**: Update event details after creation
- **Registration Management**: View and manage event registrations
- **Check-in System**: QR code-based check-in for attendees
- **Event Analytics**: View statistics (participants, revenue, etc.)

#### **For Attendees:**
- **Browse Events**: Search and filter events
  - Filter by: Upcoming, Free, Paid
  - Sort by: Date, Recently Added, Title
  - Search by: Title, description, organizer, location
- **Event Details**: View comprehensive event information
- **Registration**: Register for events with dynamic forms
- **Ticket Generation**: QR code tickets for registered events
- **Payment Processing**: Secure payment via Razorpay
- **Event History**: View participated events

### 3. **Organization Management**
- **Organization Registration**: Create new organizations
- **Organization Editing**: Update organization details
- **Member Management**: Add/remove members
- **Organization Dashboard**: View organization stats

### 4. **Admin Dashboard**
- **User Management**: View and manage user profiles
- **Event Approval**: Approve/reject event submissions
- **Organization Management**: Manage organizations
- **Recruitment Management**: Handle recruitment applications
- **Data Export**: Export data to CSV/Excel
- **CRUD Operations**: Full CRUD interface for all entities

### 5. **Payment Integration**
- **Razorpay Integration**: Secure payment processing
- **Order Creation**: Server-side order generation
- **Payment Status Tracking**: Track payment status
- **Refund Handling**: Handle payment refunds

### 6. **QR Code System**
- **Ticket Generation**: Generate QR codes for event tickets
- **QR Code Scanner**: Mobile-friendly scanner for check-ins
- **Check-in Verification**: Validate tickets at event entry
- **Check-in History**: Track check-in times

### 7. **Email Notifications**
- **Registration Confirmation**: Email sent after event registration
- **Payment Confirmation**: Email sent after successful payment
- **Event Reminders**: Automated event reminders
- **Custom Email Templates**: Nodemailer integration

### 8. **Social Features**
- **Posts/Blog**: Create and manage posts
- **Post Editing**: Edit existing posts
- **Post Deletion**: Remove posts
- **Post Feed**: View posts from users/organizations

### 9. **Recruitment System**
- **Application Form**: Comprehensive recruitment form
  - Personal information
  - Academic details
  - Areas of interest
  - Previous participation
- **Application Management**: Admin can view/manage applications

### 10. **User Dashboard**
- **Profile Management**: Update profile information
- **Avatar Upload**: Profile picture management
- **Event Statistics**: View participated/hosted event counts
- **Upcoming Events**: Display next upcoming event
- **Quick Actions**: Quick access to create events, view registrations

---

## Key Features

### Dynamic Form Builder
- **Visual Form Builder**: Drag-and-drop form creation
- **Field Types**: Text, email, number, select, checkbox, payment
- **Validation**: Required/optional field configuration
- **Order Management**: Reorder form fields
- **Real-time Preview**: See form as you build

### Event Registration Flow
1. User browses events
2. Clicks on event to view details
3. Clicks "Register" button
4. Fills out dynamic registration form
5. If paid event, proceeds to payment
6. Completes Razorpay payment
7. Receives confirmation email
8. Gets QR code ticket
9. Presents QR code at event for check-in

### Check-in Process
1. Event organizer opens check-in page
2. Scanner initializes camera
3. Attendee presents QR code ticket
4. Scanner reads QR code
5. System validates ticket
6. Updates check-in status in database
7. Records check-in timestamp

---

## Database Schema (Supabase)

### Main Tables:
- **profiles**: User profile information
- **events**: Event details and metadata
- **event_registrations**: Event registration records
- **event_form_fields**: Dynamic form field definitions
- **organizations**: Organization/club information
- **posts**: Social/blog posts
- **recruitment**: Recruitment applications
- **orders**: Payment order records

---

## API Routes

### `/api/create-order`
- **Method**: POST
- **Purpose**: Create Razorpay payment order
- **Request**: `{ amount: number }`
- **Response**: `{ orderId: string }`

### `/api/send-email`
- **Method**: POST
- **Purpose**: Send email notifications
- **Features**: Registration confirmations, payment receipts

---

## User Roles

1. **Admin**: Full system access, can manage all entities
2. **Organizer**: Can create/manage events, view registrations
3. **User**: Can browse events, register, view tickets

---

## Security Features

- **Row Level Security (RLS)**: Supabase RLS policies
- **Authentication Required**: Protected routes
- **Role-Based Access**: Different permissions per role
- **Secure Payment**: Razorpay secure payment gateway
- **Input Validation**: Form validation on client and server

---

## UI/UX Features

- **Dark Theme**: Modern dark mode interface
- **Responsive Design**: Mobile-first responsive layout
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages
- **Toast Notifications**: Real-time feedback
- **Smooth Animations**: Framer Motion animations
- **Accessible**: ARIA labels and keyboard navigation

---

## Development Workflow

1. **Local Development**: `npm run dev`
2. **Build**: `npm run build`
3. **Start Production**: `npm start`
4. **Linting**: `npm run lint`

---

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
EMAIL_HOST=smtp_host
EMAIL_USER=email_user
EMAIL_PASS=email_password
```

---

## Project Highlights

1. **Full-Stack Event Management**: Complete solution from event creation to check-in
2. **Dynamic Forms**: Flexible form builder for custom registration requirements
3. **Payment Integration**: Seamless payment processing with Razorpay
4. **QR Code System**: Modern ticketing and check-in system
5. **Admin Panel**: Comprehensive admin dashboard for system management
6. **Responsive Design**: Works on all devices
7. **Type-Safe**: Full TypeScript implementation
8. **Modern Stack**: Latest Next.js 16 with App Router

---

## Future Enhancements (Potential)

- Real-time notifications
- Event calendar view
- Social sharing features
- Event reviews and ratings
- Advanced analytics dashboard
- Multi-language support
- Mobile app (React Native)
- Event recommendations based on user interests

---

This is a production-ready event management platform suitable for organizations, clubs, and institutions to manage their events efficiently.


