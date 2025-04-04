"use client";

import PageHeader from "@/components/common/PageHeader";
import PageLayout from "@/components/layout/PageLayout";

export default function LogsPage() {
  return (
    <PageLayout>
      <div className="p-8">
        <PageHeader 
          title="운행 일지" 
          description="차량 운행 기록을 관리하고 조회할 수 있습니다." 
        />
      </div>
    </PageLayout>
  );
} 