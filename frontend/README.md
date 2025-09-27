# Moonight Protocol Frontend

A privacy-focused Next.js frontend for the Moonight Protocol, featuring anonymous authentication, zero-knowledge proofs, and confidential lending circle interactions.

## 🌟 Features

### Privacy-First Design
- **Anonymous Authentication**: Zero-knowledge identity generation with no personal information storage
- **Confidential Trust Scores**: Private trust score display with ZK proof verification
- **Anonymous Bidding**: Submit confidential bids using zero-knowledge proofs
- **Encrypted Messaging**: End-to-end encrypted communication between circle members
- **Privacy-Preserving Payments**: Payment forms with minimal data exposure
- **Cross-Chain Privacy**: Multi-blockchain wallet integration with private state channels

### Zero-Knowledge Interactions
- **ZK Proof Generation UI**: User-friendly interface for generating various types of ZK proofs
- **Real-time Proof Status**: Visual feedback during proof generation and verification
- **Privacy Controls**: Granular controls for data visibility and anonymity settings

### User Experience
- **Dark Theme**: Privacy-focused design with midnight color palette
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Loading States**: Smooth loading animations and skeleton screens
- **Real-time Updates**: Live updates for bidding, messaging, and wallet activities

## 🏗️ Architecture

### Component Structure
```
src/
├── app/                    # Next.js 13+ app router
│   ├── bidding/           # Anonymous bidding interface
│   ├── messages/          # Encrypted messaging
│   ├── wallet/            # Cross-chain wallet
│   └── layout.tsx         # Root layout with privacy theme
├── components/
│   ├── auth/              # Anonymous authentication
│   ├── bidding/           # Bidding components
│   ├── dashboard/         # Privacy dashboard
│   ├── layout/            # Navigation and layout
│   ├── messaging/         # Encrypted messaging
│   ├── payments/          # Cross-chain wallet
│   ├── ui/                # Reusable UI components
│   └── zkproof/           # ZK proof generation
└── styles/                # Global styles and themes
```

### Technology Stack
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS with custom midnight theme
- **Icons**: Heroicons for consistent iconography
- **Animations**: CSS animations for privacy-focused transitions
- **State Management**: React hooks with local state

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production
```bash
# Create optimized production build
npm run build

# Start production server
npm start
```

## 🎨 Privacy-Focused Design System

### Color Palette
- **Midnight Series**: Primary dark theme colors (midnight-50 to midnight-950)
- **ZK Purple**: Privacy-focused accent color (#8b5cf6)
- **Trust Green**: Verification and success states (#10b981)
- **Warning Amber**: Alerts and notifications (#f59e0b)

### Design Principles
1. **Minimal Data Exposure**: Show only necessary information
2. **Privacy Controls**: Clear privacy toggles and status indicators
3. **Anonymous by Default**: No personal identifiers in the UI
4. **Trust Through Transparency**: Clear indication of privacy features

## 🔒 Privacy Features

### Anonymous Authentication
- Zero-knowledge identity generation
- No personal information storage
- Client-side key management
- Anonymous session handling

### Confidential Trust Scores
- Privacy-preserving score calculation
- ZK proof verification
- Anonymous peer comparisons
- Encrypted score history

### Anonymous Bidding
- Confidential bid submission
- Range proof validation
- Anonymous winner selection
- Privacy-preserving auction mechanics

### Encrypted Messaging
- End-to-end encryption
- Anonymous participant identifiers
- Perfect forward secrecy
- Metadata protection

### Cross-Chain Privacy
- Multi-blockchain wallet support
- Private transaction history
- Anonymous cross-chain transfers
- Privacy-preserving balance aggregation

## 📱 Mobile Experience

The frontend is built mobile-first with:
- Responsive grid layouts
- Touch-friendly interactions
- Optimized loading states
- Adaptive navigation

## 🛡️ Security Considerations

- Client-side ZK proof generation
- No sensitive data transmission
- Encrypted local storage
- Secure random number generation
- Input validation and sanitization

## 🔧 Development

### Code Structure
- **TypeScript**: Full type safety
- **Component Architecture**: Reusable, composable components  
- **Custom Hooks**: Shared logic extraction
- **Error Boundaries**: Graceful error handling

### Styling Approach
- **Utility-First**: Tailwind CSS for rapid development
- **Custom Properties**: CSS variables for theming
- **Component Variants**: Consistent design patterns
- **Responsive Design**: Mobile-first breakpoints

## 📄 License

MIT License - see the main project LICENSE file for details.

## 🤝 Contributing

Please refer to the main project README for contribution guidelines.
