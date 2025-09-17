// src/app/page.tsx
import StatsCard from "@/components/ui/StatsCard";
import TasksTable from "@/components/ui/TasksTable";
import Timelog from "@/components/ui/Timelog";
import App from "next/app";
import AppreciationsTable from "@/components/ui/AppreciationsTable";
import InfoCard from "@/components/ui/InfoCard";

export default function Dashboard() {
  return (
    <div className="h-screen overflow-y-auto p-6 space-y-6">
      <section className="grid grid-cols-3 gap-6">
        <div className="col-span-1 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Welcome Ritik Singh</h3>
          <div className="mt-4 flex gap-4 items-center">
            <img src="/Images/image1.png" className="w-16 h-16 rounded-full" />
            <div>
              <p className="font-medium">Ritik Singh</p>
              <p className="text-sm text-gray-500">
                Manager • Human Resources
              </p>
              <p className="text-sm text-gray-400">Employee Code - EMP-01</p>
            </div>
          </div>
        </div>

        <div className="col-span-2 bg-white p-4 rounded-lg shadow">
          <Timelog />
        </div>
      </section>

      <section className="grid grid-cols-4 gap-6">
        <StatsCard title="Projects" pending={8} overdue={4} />
        <StatsCard title="Tasks" pending={8} overdue={4} />
        <StatsCard title="Deals" pending={2} overdue={0} />
        <StatsCard title="Follow Ups" pending={0} overdue={0} />
      </section>

      <section>
        <TasksTable />
      </section>

      <section>
        <AppreciationsTable />
      </section>

      <section className="grid grid-cols-3 gap-6">
        <InfoCard title="Birthdays" icon="birthday" />
        <InfoCard title="On Leave Today" icon="leave" />
        <InfoCard title="On Work From Home Today" icon="wfh" />
      </section>
    </div>
  );
}
