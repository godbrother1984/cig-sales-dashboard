# เอกสารโครงการ Sales Dashboard

## ภาพรวมโครงการ

Sales Dashboard เป็นแอปพลิเคชันเว็บสำหรับการจัดการและติดตามข้อมูลการขายที่ได้รับการพัฒนาด้วย React, TypeScript และ Tailwind CSS โดยมีการเชื่อมต่อกับระบบ Microsoft Dynamics เพื่อแสดงข้อมูลการขายแบบเรียลไทม์

## 🚀 Quick Start Guide

### Prerequisites
```bash
# ตรวจสอบ Node.js version (ต้องการ Node.js 18+)
node --version

# ตรวจสอบ npm/bun
npm --version
# หรือ
bun --version
```

### Installation & Setup
```bash
# 1. Clone โครงการ (ถ้าใช้ Git)
git clone <repository-url>
cd cig-sales-dashboard

# 2. ติดตั้ง dependencies
npm install
# หรือใช้ bun (แนะนำ - เร็วกว่า)
bun install

# 3. เริ่มต้น development server
npm run dev
# หรือ
bun dev

# 4. เปิด browser ที่ http://localhost:8080
```

### First Time Setup
1. **เลือกผู้ใช้**: หน้าแรกจะแสดง User Selection - เลือกผู้ใช้ใดก็ได้
2. **ตั้งค่า API** (Optional): คลิก "API Settings" เพื่อกำหนดค่า API endpoints
3. **เริ่มใช้งาน**: ระบบพร้อมใช้งานทันที

### 5-Minute Demo Flow
```bash
# หลังจากรัน npm run dev แล้ว:
1. เปิด http://localhost:8080
2. เลือก User (เช่น "John Doe - Admin")
3. ดู Dashboard หลัก (KPIs, Charts)
4. ไปที่ /targets เพื่อตั้งเป้าหมาย
5. ไปที่ /manual-entry เพื่อเพิ่มข้อมูลทดสอบ
```

## ฟีเจอร์หลัก

### 1. Dashboard หลัก (/)
- **KPI Summary**: แสดงสรุปตัวเลขการขายหลัก
- **Target vs Actual Chart**: กราฟเปรียบเทียบเป้าหมายกับผลการขายจริง
- **Margin Band Chart**: แสดงการกระจายของ Margin ตามช่วงต่างๆ
- **Trend Chart**: กราฟแสดงแนวโน้มการขายรายเดือน
- **Action Items**: คำแนะนำการดำเนินงานตามผลการขาย

### 2. การจัดการเป้าหมาย (/targets)
- **Monthly Targets**: การตั้งเป้าหมายรายเดือน
- **Annual Targets**: การตั้งเป้าหมายรายปี
- **Business Unit Targets**: การตั้งเป้าหมายแยกตาม Business Unit
- **Rollover Strategy**: กลยุทธ์การดำเนินการเมื่อเป้าหมายไม่สำเร็จ

### 3. การบันทึกข้อมูลด้วยตนเอง (/manual-entry)
- **Order Entry**: บันทึกออเดอร์สำหรับ HBPM และ M&E
- **Order Management**: จัดการและลบออเดอร์ที่บันทึก

### 4. ระบบการจัดการผู้ใช้ (/login)
- **User Selection**: เลือกผู้ใช้จากรายการที่มีอยู่
- **Role-based Access**: การจัดการสิทธิ์ตาม Role (admin, editor, tester)

## สถาปัตยกรรมระบบ

### Frontend Architecture
```
src/
├── components/          # UI Components
│   ├── ui/             # Shadcn UI Components
│   ├── KPISummary.tsx  # แสดง KPI หลัก
│   ├── TargetActualChart.tsx # กราฟเปรียบเทียบ
│   ├── MarginBandChart.tsx   # กราฟ Margin
│   ├── TrendChart.tsx       # กราฟแนวโน้ม
│   └── ...
├── hooks/              # Custom React Hooks
│   ├── useAuth.ts      # จัดการ Authentication
│   ├── useSalesData.ts # จัดการข้อมูลการขาย
│   └── ...
├── pages/              # หน้าหลักของแอป
│   ├── Index.tsx       # Dashboard หลัก
│   ├── Targets.tsx     # จัดการเป้าหมาย
│   ├── ManualEntry.tsx # บันทึกข้อมูลด้วยตนเอง
│   └── Login.tsx       # เลือกผู้ใช้
├── services/           # API Services
│   ├── dynamicsApiService.ts # เชื่อมต่อ MS Dynamics
│   ├── userApiService.ts     # จัดการข้อมูลผู้ใช้
│   └── ...
├── utils/              # Utility Functions
└── types/              # TypeScript Type Definitions
```

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | Frontend Framework |
| TypeScript | 5.5.3 | Type Safety |
| Vite | 5.4.1 | Build Tool & Dev Server |
| Tailwind CSS | 3.4.11 | CSS Framework |
| Shadcn/ui | Latest | UI Component Library (Radix UI based) |
| React Router | 6.26.2 | Client-side Routing |
| React Query (@tanstack) | 5.56.2 | Server State Management |
| Recharts | 2.12.7 | Chart & Data Visualization |
| Lucide React | 0.462.0 | Icon Library |
| React Hook Form | 7.53.0 | Form State Management |
| Zod | 3.23.8 | Schema Validation |
| Date-fns | 3.6.0 | Date Utilities |
| ESLint | 9.9.0 | Code Linting |
| PostCSS | 8.4.47 | CSS Processing |

## โครงสร้างข้อมูล

### Types หลัก

#### ManualOrder
```typescript
interface ManualOrder {
  id: string;
  orderDate: string;
  customerName: string;
  businessUnit: 'Coil' | 'Unit' | 'M&E' | 'HBPM' | 'MKT';
  orderValue: number;
  grossMargin: number;
  grossProfit: number;
  salesperson: string;
}
```

#### SalesData
```typescript
interface SalesData {
  totalSales: number;
  totalGP: number;
  totalOrders: number;
  averageMargin: number;
}
```

#### EnhancedTargets
```typescript
interface EnhancedTargets {
  inputMethod: 'monthly' | 'annual';
  rolloverStrategy: 'none' | 'cumulative' | 'quarterly' | 'redistribute';
  globalTargets: boolean;
  businessUnitTargets: BUTargets;
  selectedBusinessUnit: string;
}
```

## การเชื่อมต่อ API

### Microsoft Dynamics API

#### Real API Service Implementation
```typescript
// src/services/dynamicsApiService.ts
import { BaseApiService } from './baseApiService';

export class DynamicsApiService extends BaseApiService {
  constructor(config: ApiConfig) {
    super(config);
  }

  async fetchSalesData(year: number = 2024): Promise<SalesDataResponse> {
    try {
      const response = await this.get(`/SalesData?year=${year}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
      // Fallback to mock data for development
      return this.getMockSalesData();
    }
  }

  private getMockSalesData(): SalesDataResponse {
    return {
      monthlyData: [
        {
          month: 'January',
          sales: 2500000,
          gp: 625000,
          totalOrders: 45,
          salespeople: { 'John Doe': { sales: 500000, gp: 125000, orders: 10 } }
        }
        // ... more mock data
      ],
      marginBands: [
        { band: '0-10%', orders: 5, value: 250000, percentage: 10 },
        { band: '10-20%', orders: 15, value: 750000, percentage: 30 }
      ]
    };
  }
}

// การใช้งานจริง
const apiConfig = JSON.parse(localStorage.getItem('apiConfig') || '{}');
const dynamicsApi = new DynamicsApiService(apiConfig);
const salesData = await dynamicsApi.fetchSalesData(2025);
```

### API Endpoints (Real Implementation)

| Endpoint | Method | Parameters | Purpose | Status |
|----------|--------|------------|---------|--------|
| `/SalesdashboardUser/users` | GET | - | ดึงรายการผู้ใช้ทั้งหมด | ✅ Implemented |
| `/SalesData` | GET | `?year=2025` | ดึงข้อมูลการขายจาก Dynamics | 🔄 Mock Data |
| `/ManualOrders` | GET | - | ดึงออเดอร์ที่บันทึกด้วยตนเอง | 📱 localStorage |
| `/ManualOrders` | POST | OrderData | สร้างออเดอร์ใหม่ | 📱 localStorage |
| `/ManualOrders/{id}` | DELETE | - | ลบออเดอร์ | 📱 localStorage |
| `/SalesTargets` | GET/POST | TargetData | จัดการเป้าหมายการขาย | 📱 localStorage |

#### API Configuration Example
```typescript
// API Config ที่เก็บใน localStorage
const apiConfig = {
  baseUrl: 'https://your-api.com/api',
  apiKey: 'your-api-key', // Optional
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token' // Optional
  }
};

// บันทึกผ่าน UI หรือ programmatically
localStorage.setItem('apiConfig', JSON.stringify(apiConfig));
```

#### Example API Responses
```typescript
// GET /SalesdashboardUser/users
{
  "users": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@company.com", 
      "role": "admin",
      "created_at": "2024-01-15T10:00:00Z",
      "last_login": "2025-01-08T14:30:00Z"
    }
  ]
}

// GET /SalesData?year=2025
{
  "monthlyData": [
    {
      "month": "January",
      "sales": 2500000,
      "gp": 625000,
      "totalOrders": 45,
      "salespeople": {
        "John Doe": { "sales": 500000, "gp": 125000, "orders": 10 }
      },
      "customers": {
        "Company A": { "sales": 300000, "gp": 75000, "orders": 5 }
      }
    }
  ],
  "marginBands": [
    { "band": "0-10%", "orders": 5, "value": 250000, "percentage": 10 },
    { "band": "10-20%", "orders": 15, "value": 750000, "percentage": 30 }
  ]
}
```

## การกำหนดค่า (Configuration)

## 🛠️ Development Environment Setup

### System Requirements
```bash
# Required:
Node.js >= 18.0.0
npm >= 8.0.0 หรือ bun >= 1.0.0

# Recommended:
Node.js 20.x LTS
bun 1.x (faster package manager)
VS Code with extensions:
- TypeScript + JavaScript
- Tailwind CSS IntelliSense  
- ES7+ React/Redux/React-Native snippets
- Prettier (optional)
```

### Environment Variables
```bash
# ⚠️ หมายเหตุ: โครงการนี้ไม่ใช้ environment variables แบบปกติ
# แต่ใช้การตั้งค่าผ่าน UI และ localStorage แทน

# ไฟล์ .env ไม่จำเป็น แต่สามารถสร้างได้สำหรับอนาคต:
# VITE_API_BASE_URL=https://your-api.com/api
# VITE_API_KEY=your-api-key

# การใช้งานจริงในปัจจุบัน:
# 1. API Configuration ผ่าน UI (Settings button)
# 2. บันทึกใน localStorage
# 3. ดึงมาใช้ใน API services
```

### IDE Setup (VS Code)
```json
// .vscode/settings.json (แนะนำ)
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "editor.formatOnSave": true,
  "tailwindCSS.experimental.classRegex": [
    ["cva\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"],
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}

// .vscode/extensions.json (แนะนำ extensions)
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag"
  ]
}
```

### Development Workflow

#### Daily Development Flow
```bash
# 1. เริ่มต้นวัน - อัพเดตโค้ด
git pull origin main

# 2. เช็คสถานะโค้ด
git status
npm run lint  # ดู linting issues

# 3. เริ่ม development server
npm run dev
# หรือ
bun dev

# 4. Development loop:
# - แก้ไขโค้ด
# - ดูผลลัพธ์ที่ localhost:8080
# - Hot reload ทำงานอัตโนมัติ
# - ตรวจสอบ console errors

# 5. ก่อน commit - ตรวจสอบโค้ด
npm run build    # ทดสอบ build
npm run lint     # ตรวจสอบ code quality
```

#### Git Workflow
```bash
# สร้าง feature branch
git checkout -b feature/new-dashboard-component

# Commit changes
git add .
git commit -m "feat: add new KPI card component"

# Push และสร้าง PR
git push origin feature/new-dashboard-component
# สร้าง PR ผ่าน GitHub UI

# หลังจาก merge - cleanup
git checkout main
git pull origin main
git branch -d feature/new-dashboard-component
```

#### Component Development Workflow
```bash
# 1. สร้าง component ใหม่
# src/components/NewComponent.tsx

# 2. เพิ่ม types (ถ้าจำเป็น)  
# src/types/index.ts

# 3. เพิ่ม tests (เมื่อมี testing setup)
# src/components/__tests__/NewComponent.test.tsx

# 4. Update documentation
# เพิ่มใน PROJECT_DOCUMENTATION.md

# 5. Export component
# src/components/index.ts (ถ้ามี)
```

### API Configuration (Runtime)
```typescript
// การตั้งค่า API ผ่าน UI (ไม่ใช้ environment variables)
interface ApiConfig {
  baseUrl: string;         // 'https://your-api.com/api'
  apiKey?: string;         // API key (optional)
  timeout: number;         // 10000 (10 seconds)
  headers?: Record<string, string>;
}

// บันทึกและใช้งาน:
// 1. ผู้ใช้คลิก "API Settings" 
// 2. ใส่ข้อมูล API configuration
// 3. บันทึกลง localStorage
// 4. API services จะดึงค่าจาก localStorage มาใช้

// ตัวอย่างการใช้:
const apiConfig = JSON.parse(localStorage.getItem('apiConfig') || '{}');
const dynamicsApi = new DynamicsApiService(apiConfig);
```

### Hot Reload & Development
```typescript
// Vite Hot Module Replacement (HMR)
// - เปลี่ยน React components → instant reload
// - เปลี่ยน CSS/Tailwind → instant update  
// - เปลี่ยน TypeScript → compile และ reload
// - Error overlay แสดงใน browser เมื่อมี errors

// Development debugging:
console.log('Current environment:', import.meta.env.MODE);
console.log('Dev server:', import.meta.env.DEV);

// Fast refresh สำหรับ React components
if (import.meta.hot) {
  import.meta.hot.accept();
}
```

## การใช้งาน

### การเริ่มต้นใช้งาน

1. **เลือกผู้ใช้**: เข้าสู่ระบบโดยเลือกผู้ใช้จากรายการ
2. **ตั้งค่า API**: กำหนดค่า API ผ่าน Settings button
3. **ดูข้อมูล Dashboard**: ตรวจสอบ KPI และกราฟต่างๆ
4. **ตั้งเป้าหมาย**: กำหนดเป้าหมายการขายผ่านหน้า Targets
5. **บันทึกข้อมูลเพิ่มเติม**: บันทึกออเดอร์ผ่านหน้า Manual Entry

### การใช้งาน Dashboard

#### การกรองข้อมูล
- **Business Unit**: กรองตาม Business Unit (Coil, Unit, M&E, HBPM, MKT)
- **Customer**: กรองตามลูกค้า
- **Salesperson**: กรองตาม Salesperson

#### การเลือกช่วงเวลา
- **Monthly**: ดูข้อมูลรายเดือน
- **QTD (Quarter to Date)**: ดูข้อมูลตั้งแต่ต้นไตรมาส
- **YTD (Year to Date)**: ดูข้อมูลตั้งแต่ต้นปี

### การจัดการเป้าหมาย

#### วิธีการตั้งเป้าหมาย
1. **Monthly Input**: ตั้งเป้าหมายรายเดือน
2. **Annual Input**: ตั้งเป้าหมายรายปีแล้วกระจายเป็นรายเดือน

#### Rollover Strategy
- **None**: ไม่มีการดำเนินการพิเศษ
- **Cumulative**: รวมเป้าหมายที่ขาดไปในเดือนถัดไป
- **Quarterly**: กระจายเป้าหมายที่ขาดในไตรมาส
- **Redistribute**: กระจายเป้าหมายที่ขาดในเดือนที่เหลือ

## การ Deployment

### Local Development
```bash
# ติดตั้ง dependencies
npm install
# หรือใช้ bun (recommended)
bun install

# เริ่มต้น development server (รันที่ port 8080)
npm run dev
# หรือ
bun dev

# Build สำหรับ production
npm run build
# หรือ
bun run build

# Build สำหรับ development mode
npm run build:dev

# Preview production build
npm run preview

# Run linting
npm run lint
```

### Production Deployment
- ใช้ Lovable Publish feature
- รองรับ Custom Domain (ต้องการ Paid Plan)

## 🔧 Troubleshooting & Common Issues

### เครื่องมือ Debug
- **Browser DevTools**: F12 → Console tab
- **React Query DevTools**: เปิดใช้ใน development mode
- **Network Tab**: ตรวจสอบ API requests/responses
- **Vite DevTools**: Hot reload และ error overlay

### ปัญหาที่พบบ่อยและการแก้ไข

#### 1. 🚨 Port 8080 ถูกใช้งานแล้ว
```bash
# Error: Port 8080 is already in use
# แก้ไข: เปลี่ยน port ใน vite.config.ts
export default defineConfig({
  server: {
    host: "::",
    port: 3000, // เปลี่ยนเป็น port อื่น
  },
});

# หรือ kill process ที่ใช้ port 8080
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8080 | xargs kill -9
```

#### 2. 🚨 Dependencies Installation Issues
```bash
# Error: node_modules conflicts
# แก้ไข: ลบและติดตั้งใหม่
rm -rf node_modules package-lock.json
npm install

# หรือใช้ bun
rm -rf node_modules bun.lockb
bun install

# สำหรับ Windows PowerShell:
Remove-Item -Recurse -Force node_modules, package-lock.json
npm install
```

#### 3. 🚨 TypeScript Errors
```bash
# Error: Type checking issues
# แก้ไข: ระบบใช้ relaxed TypeScript config
# ดู tsconfig.json:
{
  "noImplicitAny": false,
  "strictNullChecks": false
}

# หาก error ยังคงมี ให้ check:
npm run lint  # ดู ESLint errors
```

#### 4. 🚨 API Connection Issues
```typescript
// ตรวจสอบ API configuration
// ใน browser console:
console.log('API Config:', localStorage.getItem('apiConfig'));

// หรือดู Network tab ใน DevTools
// ดูว่า API requests ไปที่ URL ไหน

// แก้ไข: ตั้งค่า API ผ่าน UI
// 1. คลิก "API Settings" button
// 2. ใส่ Base URL และ API Key (ถ้ามี)
// 3. Test connection
```

#### 5. 🚨 Data Loading Issues
```typescript
// ตรวจสอบข้อมูลใน console
console.log('Sales Data:', salesData);
console.log('Loading State:', isLoading);
console.log('Manual Orders:', localStorage.getItem('manualOrders'));

// ปัญหา: ข้อมูลไม่โหลด
// แก้ไข:
// 1. ดู Network tab - มี API calls หรือไม่
// 2. ตรวจสอบ localStorage มีข้อมูล manual orders หรือไม่
// 3. ลองเพิ่มข้อมูลผ่าน Manual Entry
```

#### 6. 🚨 Build Issues
```bash
# Error: Build failed
npm run build

# ดู error messages และแก้ไข:
# - Type errors: ดู TypeScript errors
# - Import errors: ตรวจสอบ import paths
# - Asset errors: ตรวจสอบไฟล์ใน public folder

# Clean build:
rm -rf dist
npm run build
```

#### 7. 🚨 Chart Rendering Issues
```typescript
// ปัญหา: Charts ไม่แสดง
// ตรวจสอบ:
console.log('Chart Data:', chartData);

// แก้ไข:
// 1. ตรวจสอบ data format สำหรับ Recharts
// 2. ดู browser console มี errors หรือไม่
// 3. ลองใช้ mock data ดู
const mockData = [
  { month: 'Jan', sales: 100000, gp: 25000 },
  { month: 'Feb', sales: 120000, gp: 30000 }
];
```

#### 8. 🚨 localStorage Issues
```typescript
// ปัญหา: Data หาย หรือ corrupted
// แก้ไข: Clear localStorage
localStorage.clear();
// หรือลบเฉพาะ keys
localStorage.removeItem('manualOrders');
localStorage.removeItem('enhancedSalesTargets');
localStorage.removeItem('apiConfig');

// รีเฟรชหน้าใหม่
window.location.reload();
```

### 🔍 Debug Workflow

#### Step 1: Check Browser Console
```bash
1. เปิด F12 DevTools
2. ไปที่ Console tab
3. ดู error messages (สีแดง)
4. ดู warning messages (สีเหลือง)
```

#### Step 2: Check Network Requests
```bash
1. ไปที่ Network tab
2. Reload หน้า
3. ดู API requests ที่ fail (สีแดง)
4. ตรวจสอบ Request/Response headers
```

#### Step 3: Check Application State
```bash
1. ไปที่ Application tab
2. ดู Local Storage
3. ตรวจสอบค่าที่บันทึกไว้
4. ลบข้อมูลที่ corrupt
```

### 📞 Getting Help
```bash
# Check logs:
npm run dev  # ดู server logs

# Check file changes:
git status   # ดูว่าแก้ไขไฟล์อะไรไป

# Reset to working state:
git stash    # เก็บการเปลี่ยนแปลง
git pull     # ดึงโค้ดล่าสุด
```

## File Structure รายละเอียด

## 📚 Component API Documentation

### UI Components (src/components/ui/)

#### Button Component
```typescript
// src/components/ui/button.tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

// Usage Examples:
<Button variant="default">Primary Action</Button>
<Button variant="outline" size="sm">
  <Settings className="h-4 w-4 mr-2" />
  Settings
</Button>
<Button variant="destructive">Delete</Button>
```

#### Card Component
```typescript
// src/components/ui/card.tsx
// Modular card system
<Card className="border-l-4 border-l-primary">
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
    <CardTitle className="text-sm font-medium">KPI Title</CardTitle>
    <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">฿2,500,000</div>
    <div className="text-xs text-muted-foreground">Target: ฿3,000,000</div>
  </CardContent>
</Card>
```

### Business Components (src/components/)

#### KPISummary Component
```typescript
// src/components/KPISummary.tsx
interface KPISummaryProps {
  data: {
    totalSales: number;
    totalGP: number;
    totalOrders: number;
    averageMargin: number;
  };
  targets: {
    sales: number;
    gp: number;
  };
  gapToSalesTarget: number;
  gapToGPTarget: number;
  requiredAverageMargin: number;
}

// Usage:
<KPISummary 
  data={salesData.currentMonth}
  targets={currentTargets}
  gapToSalesTarget={gapToSalesTarget}
  gapToGPTarget={gapToGPTarget}
  requiredAverageMargin={requiredAverageMargin}
/>
```

#### DashboardFilters Component
```typescript
// src/components/DashboardFilters.tsx
interface DashboardFiltersProps {
  filters: {
    businessUnit: string;
    customerName: string;
    salesperson: string;
  };
  onFilterChange: (filters: any) => void;
  salesData?: any;
}

// Usage:
const [filters, setFilters] = useState({
  businessUnit: 'all',
  customerName: 'all', 
  salesperson: 'all'
});

<DashboardFilters 
  filters={filters} 
  onFilterChange={setFilters}
  salesData={salesData}
/>
```

#### TargetActualChart Component
```typescript
// src/components/TargetActualChart.tsx
interface TargetActualChartProps {
  salesActual: number;
  salesTarget: number;
  gpActual: number;
  gpTarget: number;
}

// Usage:
<TargetActualChart 
  salesActual={salesData.currentMonth.totalSales}
  salesTarget={currentTargets.sales}
  gpActual={salesData.currentMonth.totalGP}
  gpTarget={currentTargets.gp}
/>
```

#### OrderForm Component  
```typescript
// src/components/OrderForm.tsx
interface OrderFormProps {
  onSubmit: (order: ManualOrder) => void;
  isLoading?: boolean;
}

// ManualOrder interface:
interface ManualOrder {
  id: string;
  orderDate: string;
  customerName: string;
  businessUnit: 'Coil' | 'Unit' | 'M&E' | 'HBPM' | 'MKT';
  orderValue: number;
  grossMargin: number;
  grossProfit: number;
  salesperson: string;
}

// Usage:
const handleOrderSubmit = (order: ManualOrder) => {
  // บันทึกลง localStorage
  const orders = JSON.parse(localStorage.getItem('manualOrders') || '[]');
  orders.push({ ...order, id: Date.now().toString() });
  localStorage.setItem('manualOrders', JSON.stringify(orders));
};

<OrderForm onSubmit={handleOrderSubmit} isLoading={isSubmitting} />
```

### Custom Hooks (src/hooks/)

#### useAuth Hook
```typescript
// src/hooks/useAuth.ts
interface AuthHook {
  users: User[];
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loadUsers: () => void;
  selectUser: (user: User) => void;
  logout: () => void;
}

// Usage:
const { users, currentUser, isAuthenticated, selectUser } = useAuth();

// เลือกผู้ใช้
const handleUserSelect = (user: User) => {
  selectUser(user);
  navigate('/');
};
```

#### useSalesData Hook
```typescript
// src/hooks/useSalesData.ts
interface SalesDataHook {
  salesData: SalesDataStructure | null;
  isLoading: boolean;
  error: string | null;
}

// Usage:
const { salesData, isLoading } = useSalesData(filters, selectedMonth, viewMode, targets);

if (isLoading) return <LoadingSpinner />;
if (!salesData) return <NoDataMessage />;
```

#### useManualOrders Hook
```typescript
// src/hooks/useManualOrders.ts  
interface ManualOrdersHook {
  orders: ManualOrder[];
  isLoading: boolean;
  addOrder: (order: Omit<ManualOrder, 'id'>) => void;
  deleteOrder: (id: string) => void;
  loadOrders: () => void;
}

// Usage:
const { orders, addOrder, deleteOrder } = useManualOrders();

// เพิ่มออเดอร์ใหม่
const newOrder = {
  orderDate: '2025-01-09',
  customerName: 'ABC Company',
  businessUnit: 'HBPM' as const,
  orderValue: 500000,
  grossMargin: 25,
  grossProfit: 125000,
  salesperson: 'John Doe'
};
addOrder(newOrder);
```

### Hooks

#### Custom Hooks (src/hooks/)
- **useAuth.ts**: จัดการ authentication state
- **useSalesData.ts**: จัดการข้อมูลการขาย
- **useManualOrders.ts**: จัดการออเดอร์ที่บันทึกด้วยตนเอง
- **useTargetsState.ts**: จัดการ state ของเป้าหมาย

### Services

#### API Services (src/services/)
- **dynamicsApiService.ts**: เชื่อมต่อ MS Dynamics API
- **userApiService.ts**: จัดการข้อมูลผู้ใช้
- **manualOrderApiService.ts**: จัดการออเดอร์ที่บันทึกด้วยตนเอง
- **salesTargetApiService.ts**: จัดการเป้าหมายการขาย

### Utils

#### Utility Functions (src/utils/)
- **dataAggregation.ts**: รวมข้อมูลจากหลายแหล่ง
- **dataFiltering.ts**: กรองข้อมูลตามเงื่อนไข
- **targetCalculations.ts**: คำนวณเป้าหมาย
- **monthUtils.ts**: จัดการข้อมูลเดือน
- **quarterUtils.ts**: จัดการข้อมูลไตรมาส

## การ Customization

### Design System
```css
/* src/index.css */
:root {
  --primary: [HSL values];
  --secondary: [HSL values];
  --background: [HSL values];
  --foreground: [HSL values];
}
```

### Theme Configuration
```javascript
// tailwind.config.ts
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
      }
    }
  }
}
```

## Security

### Authentication
- ใช้ User Selection แทน Traditional Login
- เก็บ User Session ใน localStorage
- Role-based Access Control

### API Security
- รองรับ API Key Authentication
- HTTPS connections
- Request timeout protection

## Performance

### Optimization Techniques (Implemented)
- **React Query (@tanstack)**: Server state management และ data caching
- **Vite + SWC**: Fast build และ hot reload
- **React Hooks Optimization**: useCallback และ useMemo ในส่วนที่จำเป็น
- **CSS-in-JS Variables**: Design tokens สำหรับ consistent theming
- **Component Architecture**: Modular และ reusable components

### Optimization Techniques (Planned)
- Lazy Loading สำหรับ Components (ยังไม่ implement)
- Image Optimization (ยังไม่ implement)
- Code Splitting (ยังไม่ implement)

### Monitoring
- Console Logging สำหรับ Debug และ development
- React Query DevTools (สำหรับ data fetching monitoring)
- Browser DevTools สำหรับ performance profiling

## Maintenance

### Code Quality (Implemented)
- **TypeScript 5.5.3**: Type Safety และ better developer experience
- **ESLint 9.9.0**: Code linting ด้วย React และ TypeScript rules
- **Relaxed TypeScript config**: noImplicitAny: false, strictNullChecks: false

### Code Quality (Missing)
- Prettier สำหรับ Code Formatting (ยังไม่ได้ setup)
- Husky สำหรับ pre-commit hooks (ยังไม่มี)
- Conventional Commits (ยังไม่มี)

### Testing (Not Implemented)
- Component Testing (ยังไม่มี Jest/Testing Library)
- API Integration Testing (ยังไม่มี)
- User Flow Testing (ยังไม่มี E2E testing)
- Visual Regression Testing (ยังไม่มี)

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration
2. **Advanced Analytics**: Machine Learning insights
3. **Mobile App**: React Native version
4. **Export Features**: PDF/Excel export
5. **Notification System**: Email/SMS alerts

### Technical Debt
1. **Migration to Server-side Authentication**
2. **Database Optimization**
3. **Caching Strategy Enhancement**
4. **Error Handling Improvement**

## Support และ Documentation

### Additional Resources
- [Lovable Documentation](https://docs.lovable.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)

### Contact Information
- Project URL: https://lovable.dev/projects/b917cfbb-a4a4-4fdc-8d23-21eb8eae8a7a
- GitHub Integration: Available through Lovable

---

*เอกสารนี้อัปเดตล่าสุด: 2025-01-09*