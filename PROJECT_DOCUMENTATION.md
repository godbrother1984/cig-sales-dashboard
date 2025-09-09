# เอกสารโครงการ Sales Dashboard

## ภาพรวมโครงการ

Sales Dashboard เป็นแอปพลิเคชันเว็บสำหรับการจัดการและติดตามข้อมูลการขายที่ได้รับการพัฒนาด้วย React, TypeScript และ Tailwind CSS โดยมีการเชื่อมต่อกับระบบ Microsoft Dynamics เพื่อแสดงข้อมูลการขายแบบเรียลไทม์

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
| TypeScript | Latest | Type Safety |
| Vite | Latest | Build Tool |
| Tailwind CSS | Latest | CSS Framework |
| Shadcn/ui | Latest | UI Component Library |
| React Router | 6.26.2 | Routing |
| React Query | 5.56.2 | Data Fetching |
| Recharts | 2.12.7 | Chart Library |
| Lucide React | 0.462.0 | Icons |

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
```typescript
// การเชื่อมต่อกับ MS Dynamics
const dynamicsApi = new DynamicsApiService({
  baseUrl: 'https://api.dynamics.com/salesdata',
  apiKey: 'your-api-key',
  timeout: 10000
});

// การดึงข้อมูลการขาย
const salesData = await dynamicsApi.fetchSalesData(2024);
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/SalesdashboardUser/users` | GET | ดึงรายการผู้ใช้ |
| `/ManualOrders` | GET/POST/DELETE | จัดการออเดอร์ที่บันทึกด้วยตนเอง |
| `/SalesData` | GET | ดึงข้อมูลการขายจาก Dynamics |

## การกำหนดค่า (Configuration)

### Environment Variables
```
# ไม่รองรับ VITE_* environment variables
# ใช้การตั้งค่าผ่าน API Configuration Panel แทน
```

### API Configuration
- **Base URL**: URL ของ API backend
- **API Key**: คีย์สำหรับ Authentication (ถ้ามี)
- **Timeout**: กำหนดเวลา timeout สำหรับ API calls

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

# เริ่มต้น development server
npm run dev

# Build สำหรับ production
npm run build
```

### Production Deployment
- ใช้ Lovable Publish feature
- รองรับ Custom Domain (ต้องการ Paid Plan)

## การ Debug และ Troubleshooting

### เครื่องมือ Debug
- **Console Logs**: ตรวจสอบ console ของเบราว์เซอร์
- **Network Requests**: ตรวจสอบ API calls
- **React Query DevTools**: ตรวจสอบ state ของข้อมูล

### ปัญหาที่อาจพบ

#### 1. API Connection Issues
```javascript
// ตรวจสอบการเชื่อมต่อ
const isConnected = await dynamicsApi.testConnection();
if (!isConnected) {
  console.error('API connection failed');
}
```

#### 2. Data Loading Issues
```javascript
// ตรวจสอบข้อมูลที่โหลด
console.log('Sales Data:', salesData);
console.log('Loading State:', isLoading);
```

## File Structure รายละเอียด

### Components

#### UI Components (src/components/ui/)
- **button.tsx**: ปุ่มต่างๆ พร้อม variants
- **card.tsx**: การ์ดสำหรับแสดงข้อมูล
- **chart.tsx**: Component สำหรับกราฟ
- **dialog.tsx**: Modal dialogs
- **form.tsx**: Form components
- **table.tsx**: ตาราง
- **tabs.tsx**: Tab navigation

#### Business Components (src/components/)
- **KPISummary.tsx**: แสดง KPI หลัก
- **TargetActualChart.tsx**: กราฟเป้าหมาย vs ผลจริง
- **MarginBandChart.tsx**: กราฟแสดง Margin bands
- **TrendChart.tsx**: กราฟแนวโน้มรายเดือน
- **DashboardFilters.tsx**: ตัวกรองข้อมูล
- **MonthYTDSelector.tsx**: เลือกเดือนและ view mode
- **OrderForm.tsx**: ฟอร์มสำหรับบันทึกออเดอร์
- **OrdersTable.tsx**: ตารางแสดงออเดอร์

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

### Optimization Techniques
- React Query สำหรับ Data Caching
- Lazy Loading สำหรับ Components
- Image Optimization
- Code Splitting

### Monitoring
- Console Logging สำหรับ Debug
- Network Request Monitoring
- Performance Metrics

## Maintenance

### Code Quality
- TypeScript สำหรับ Type Safety
- ESLint สำหรับ Code Linting
- Prettier สำหรับ Code Formatting

### Testing
- Component Testing
- API Integration Testing
- User Flow Testing

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

*เอกสารนี้อัปเดตล่าสุด: 2024-09-09*