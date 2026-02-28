# Eben-Ezer Application Documentation

This document provides a comprehensive overview of the Eben-Ezer application. It explains the core purpose of the software, its architecture, state management, and an exhaustive breakdown of every feature, module, and user-facing tab.

## Overview

The **Eben-Ezer App** is a highly specialized, fully integrated Customer Relationship Management (CRM), Estimating, and Project Management platform designed specifically for landscaping, hardscaping, and general contracting businesses. 

It handles the entire lifecycle of a contracting business:
1. **Lead Generation & CRM**: Capturing leads, managing clients, and tracking communications.
2. **Estimating & Proposals**: Calculating accurate costs with specialized calculators (Concrete, Turf, Snow, etc.), and generating beautiful proposals.
3. **Project & Service Management**: Scheduling work, managing crews and equipment, tracking tasks, change orders, expenses, and invoicing.
4. **Operations & Fleet**: Time tracking, GPS clock-ins, equipment maintenance tracking, and routing for service contracts.
5. **Business Intelligence**: Tracking overarching business metrics, labor burdens, overheads, and ensuring target profit margins.

---

## Architecture & State Management

The application is built with **React** (using Vite) and utilizes heavily nested React Contexts to manage global state across different modules.

### Core Modules (Contexts)
- **AuthContext**: Manages user authentication, sessions, and Role-Based Access Control (Admin, Office, Foreman, Laborer, Deliverer, Client).
- **SettingsContext**: Central hub for business metrics, overhead costs, employee wage data, and global pricing configurations (profit margins, material markups, etc.).
- **CRMContext**: Manages Leads, Clients, and Call logs.
- **EstimatesContext**: Handles the core estimating engine, proposal generation, and pricing snapshots.
- **ProjectsContext**: Manages active projects, tasks, expenses, and invoices.
- **FleetContext**: Tracks physical equipment, vehicles, and maintenance logs.
- **TimeClockContext**: Manages employee time tracking, geolocated clock-ins/outs.
- **ServicesContext**: Handles recurring maintenance contracts, routing, and daily service visits.
- **NavigationContext & DialogContext**: Handles routing between views and global modal/dialog states to keep the UI clean.

---

## Detailed Feature Breakdown & Tabs

Here is a comprehensive breakdown of every tab (View) and feature available in the application.

### 1. Dashboard (`DashboardView.tsx`)
The central command center. Provides a high-level overview of the business.
- **Quick Actions**: Buttons to quickly add a lead or start a new estimate.
- **KPIs**: Summaries of revenue, active projects, pending estimates, and pending leads.
- **Recent Activity**: A feed showing recent updates, new leads, or upcoming scheduled events.

### 2. CRM & Sales
#### Leads (`LeadsView.tsx`)
- **Lead Pipeline**: Tracks potential customers from "New" to "Contacted", "Site Visit", "Estimate Needed", and ultimately "Won" or "Lost".
- **Lead Modals**: Allows capturing basic info, service interest, and logging notes.
- **Conversion**: Seamlessly converts a won lead into a permanent Client.

#### Clients (`ClientsView.tsx` & `ClientDashboardView.tsx`)
- **Client Profiles**: Stores robust client data including address, property notes, gate codes, contact preferences, and tags (e.g., 'HOA', 'VIP').
- **Client History**: Displays a history of all estimates, projects, and total revenue for that client.
- **Client Billing**: (`ClientBillingView.tsx`) Dedicated view for managing a client's invoices and payment status.

### 3. Estimating & Proposals
#### Estimates (`EstimatesView.tsx`)
- **Specialized Calculators**: Instead of a generic line-item builder, the app has specific workflow calculators perfectly tailored for different trades:
  - `ConcreteEstimator`
  - `TurfEstimator` (Synthetic Turf)
  - `EarthworkEstimator`
  - `SnowIceEstimator`
  - `RetainingWallEstimator`
  - `PlantingTreeEstimator`
  - `CarpentryEstimator`, etc.
- **Estimate Editor (`EstimateCalculator.tsx`)**: A detailed editor to tweak line items (Labor, Material, Equipment), adjust margins, add site condition difficulty factors, and apply adjustments (trip charges, taxes).
- **Proposal Generation (`ProposalView.tsx` & `PublicProposalView.tsx`)**: Generates beautiful, client-facing proposals. Features cover images, dynamic theming, optional upsells, electronic signatures, and public URLs for clients to view and accept.

#### Pricebook (`PricebookView.tsx`)
- **Material & Labor Database**: A centralized catalog of all materials, subcontractor costs, and fees. Items are categorized (Softscape, Hardscape, Irrigation, etc.) and include default markups and unit costs.

#### Templates (`TemplatesView.tsx`)
- **Service Assemblies**: Groups of items bundled together to speed up the estimating process. For example, a "Paver Patio" template might automatically combine base material, sand, pavers, and labor based on a square-footage production rate.

### 4. Project & Operations Management
#### Projects (`ProjectsView.tsx`)
- **Project Tracking**: Converts accepted estimates into active Projects. Tracks start/end dates, completion percentage, and revenue.
- **Task Management**: Assign specific tasks to crew members.
- **Financial Tracking**: Tracks material purchasing statuses, logged expenses, change orders, and invoices against the project budget.

#### Schedule / Calendar (`CalendarView.tsx`)
- **Master Calendar**: A visual scheduling tool that displays all Appointments (Site Visits, Consultations), active Projects, and scheduled Service Visits.

#### Maintenance (`MaintenanceView.tsx`)
- **Service Contracts**: Manage recurring work (e.g., weekly mowing, monthly fertilization).
- **Routing & Dispatch**: Organizes daily "Service Visits", assigns them to crews, and optimizes the sequence/route of stops for the day.

### 5. Team & Fleet
#### Time Clock (`TimeClockView.tsx`)
- **Employee Clock-in/out**: Allows field staff to clock in and out from their mobile devices.
- **Geolocation**: Captures GPS coordinates (lat/lng) upon clock-in and clock-out to ensure crews are on-site.
- **Project Linking**: Links logged hours directly to specific projects for accurate labor cost tracking.

#### Equipment (`EquipmentView.tsx`)
- **Fleet Tracking**: A database of company vehicles and heavy machinery (skid steers, mowers, trucks).
- **Status & Location**: Tracks if equipment is "Available", "In Shop", or assigned to a specific "Project".
- **Maintenance Logs**: Logs oil changes, repairs, costs, and tracks upcoming service dates.

### 6. Communication & Media
#### Company Camera (`CompanyCameraView.tsx`)
- **Project Portfolios**: A centralized photo gallery where field workers can upload progress photos directly to projects.
- **Before/Afters**: Essential for documenting site conditions, progress, and completed work for marketing.

#### Marketing & Design Showcase (`MarketingView.tsx` & `DesignShowcaseView.tsx`)
- **Visual Proposals**: Connects leads to visual presentations.
- **3D & Images**: Stores before/after image sets and embeds 3D design links (e.g., Sketchfab) to wow prospective clients during the pitch phase.

### 7. App Configuration & Settings
#### Settings (`SettingsView.tsx`)
- **Business Profile**: Company name, logo, currency, and contact info.
- **Employee Management**: Adding team members, defining their pay type (hourly/salary), labor burden percentages, and utilization rates.
- **Overhead Calculator**: Tracks fixed monthly/annual costs (rent, insurance, software). The app uses this to calculate exactly how much overhead needs to be applied per man-hour to break even.
- **Global Pricing Rules**: Sets systemic targets like default profit margins, material markups, minimum service call fees, and emergency surcharges.
- **Proposal Theming**: Sets default fonts, brand colors, and cover image themes for all newly generated proposals.

### Client Portal Role
- If a user logs in with the role of `'Client'`, the app bypasses the internal dashboard and routes them to `ClientPortalLayout.tsx`. This provides clients with a restricted view of their own active projects, paid/unpaid invoices, and accepted estimates without exposing internal company data.
