# Mobile Order App

A real-time mobile ordering system built with Next.js, Bun, and Socket.io.

## Getting Started

### Development

Run the development server:
```bash
bun run dev
```

### Production

Build and start for production:
```bash
bun run build
bun run start
```

## System Architecture

### Tech Stack

-   **Frontend**: Next.js (App Router), TypeScript, Tailwind CSS (PostCSS v4), Socket.io Client
-   **Backend**: Bun Runtime, Custom Server (`server.ts`) using Express + Next.js + Socket.io
-   **Database**: SQLite (`prisma/dev.db`), Prisma ORM
-   **Real-time**: WebSocket (Socket.io) for order updates andadmin notifications

### Directory Structure

-   `app/admin`: Admin dashboard (Product management, Order history)
-   `app/table`: User ordering interface
-   `lib/`: Utilities (Prisma client, Socket configurations)
-   `prisma/`: Database schema and seed scripts
-   `server.ts`: Custom server entry point

### Architecture Diagram

```mermaid
graph TD
    subgraph Client ["Client Side"]
        User["User Device (Mobile)"]
        Admin["Admin Dashboard (PC/Tablet)"]
    end

    subgraph Server ["Server Side (Bun)"]
        CustomServer["Custom Server (server.ts)"]
        NextApp["Next.js App (App Router)"]
        SocketServer["Socket.io Server"]
    end

    subgraph Database ["Data Layer"]
        SQLite[("SQLite Database")]
        Prisma["Prisma ORM"]
    end

    User -->|HTTP Requests| NextApp
    Admin -->|HTTP Requests| NextApp
    
    User <-->|WebSocket (Order Placed)| SocketServer
    Admin <-->|WebSocket (Order Notification)| SocketServer
    
    CustomServer --> NextApp
    CustomServer --> SocketServer
    
    NextApp -->|Query/Mutate| Prisma
    Prisma -->|Read/Write| SQLite
```
