"use client";

import PageHeader from "@/components/common/PageHeader";
import PageLayout from "@/components/layout/PageLayout";

export default function CompaniesPage() {
  return (
    <PageLayout>
      <div className="p-8">
        <PageHeader 
          title="업체 관리" 
          description="협력 업체 정보를 관리하고 조회할 수 있습니다." 
        />
      </div>
    </PageLayout>
  );
} 