// /src/app/dashboard/eventmanage/page.tsx
import React, { Suspense } from "react";
import EventManagementClient from "./EventManagementClient";
import Loader from "@/components/ui/Loader";  

export default function EventManagePage() {
  return (
    <Suspense fallback={<div><Loader/></div>}>
      <EventManagementClient />
    </Suspense>
  );
}
