"use client";
import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { AsyncFetcher } from "@/lib/fetcher";
import { Loader } from "@/components/Loader";
import { User } from "@/app/(pages)/types/user";
import { Workspace } from "@/app/(pages)/types/workspace";

interface ContributionProps {
  user: User;
  chartData: Workspace[] | EditorContribution[];
}

export interface EditorContribution {
  id: string;
  userHandle: string;
  videoUploaded: number;
}

interface SelectedEditor {
  editorId: string;
  editorName: string;
  videoUploaded: number;
}

const COLORS = [
  "#6366f1", // indigo
  "#10b981", // emerald
  "#f59e0b", // amber
  "#ef4444", // red
  "#3b82f6", // blue
  "#8b5cf6", // violet
];

const CustomTooltip = ({ active, payload, msgPrefix, msgSuffix }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 rounded-md shadow text-black text-sm">
        <p className="font-semibold">{payload[0].name}</p>
        <p>{`${msgPrefix} : ${payload[0].value} ${
          msgSuffix ? msgSuffix : ""
        }`}</p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ percent, midAngle, cx, cy, outerRadius }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 10;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0 ? `${percent * 100}%` : "";
};

const CustomContent = ({ payload }: any) => (
  <ul className="-ml-36 text-white text-sm space-y-1">
    {payload?.map((entry: any, index: number) => (
      <li key={`item-${index}`} className="flex items-center space-x-1">
        <div
          style={{
            width: 10,
            height: 10,
            backgroundColor: entry.color,
            borderRadius: "50%",
          }}
        />
        <span>{entry.value}</span>
      </li>
    ))}
  </ul>
);
const Contribution = ({ user, chartData }: ContributionProps) => {
  const [selectedEditors, setSelectedEditors] = useState<SelectedEditor[]>([]);
  const [chartKey, setChartKey] = useState(0);

  const filteredData =
    user?.userType === "youtuber"
      ? (chartData as Workspace[])?.map((workspace) => ({
          id: workspace.id,
          name: workspace.userHandle,
          value: workspace.editors?.length || 0,
          editors: workspace.editors,
        }))
      : (chartData as EditorContribution[])?.map((editor) => ({
          id: editor.id,
          name: editor.userHandle,
          value: Number(editor.videoUploaded),
        }));

  return (
    <>
      {!chartData ? (
        <Loader />
      ) : (
        <div className="flex flex-row w-full justify-center p-4 absolute -top-5 left-0">
          {user?.userType === "editor" ? (
            <div className="w-[70%]">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={filteredData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={80}
                    paddingAngle={4}
                    cornerRadius={10}
                    isAnimationActive={true}
                    label={CustomLabel}
                    labelLine={false}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={entry.id}
                        fill={COLORS[index % COLORS.length]}
                        stroke="#0f172a"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="circle"
                    content={({ payload }) => (
                      <ul className="-ml-36 text-white text-sm space-y-1">
                        {payload?.map((entry, index) => (
                          <li
                            key={`item-${index}`}
                            className="flex items-center space-x-1"
                          >
                            <div
                              style={{
                                width: 10,
                                height: 10,
                                backgroundColor: entry.color,
                                borderRadius: "50%",
                              }}
                            />
                            <span>
                              Video Edited{" - "}
                              {entry.payload?.value}
                              {" ( "}
                              {entry.value}
                              {" )"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                  />
                  <Tooltip
                    content={(props) => (
                      <CustomTooltip {...props} msgPrefix={"Video Edited"} />
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <>
              {/* Workspace Chart */}
              <div className="w-[50%] h-[280px]">
                <ResponsiveContainer width="110%" height="100%">
                  <PieChart>
                    <Pie
                      data={filteredData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={80}
                      paddingAngle={4}
                      cornerRadius={10}
                      isAnimationActive={true}
                      label={CustomLabel}
                      labelLine={false}
                      onClick={(entry: any) => {
                        AsyncFetcher({
                          url: `api/fetch/chart?chart=2&ws=${entry.id}`,
                          cb: (data: SelectedEditor[]) => {
                            const sanitized = data?.map((item) => ({
                              ...item,
                              videoUploaded: Number(item.videoUploaded),
                            }));
                            setSelectedEditors(sanitized);
                            setChartKey((prev) => prev + 1);
                          },
                        });
                      }}
                    >
                      {filteredData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#0f172a"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="circle"
                      content={CustomContent}
                    />
                    <Tooltip
                      content={(props) => (
                        <CustomTooltip {...props} msgPrefix={"Total Editors"} />
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Editor Chart */}
              {selectedEditors.length > 0 ? (
                <div className="w-[50%] h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        key={chartKey}
                        data={selectedEditors}
                        dataKey="videoUploaded"
                        nameKey="editorName"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={4}
                        cornerRadius={10}
                        isAnimationActive={true}
                        labelLine={false}
                        label={CustomLabel}
                        startAngle={90}
                        endAngle={-270}
                      >
                        {selectedEditors.map((entry, index) => (
                          <Cell
                            key={entry.editorId}
                            fill={COLORS[index % COLORS.length]}
                            stroke="#0f172a"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        content={({ payload }) => (
                          <ul className="-ml-36 text-white text-sm space-y-1">
                            {payload?.map((entry, index) => (
                              <li
                                key={`item-${index}`}
                                className="flex items-center space-x-1"
                              >
                                <div
                                  style={{
                                    width: 10,
                                    height: 10,
                                    backgroundColor: entry.color,
                                    borderRadius: "50%",
                                  }}
                                />
                                <span>
                                  {entry.value} : Video Edtied{" - "}
                                  {entry.payload?.value}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      />
                      <Tooltip
                        content={(props) => (
                          <CustomTooltip
                            {...props}
                            msgPrefix={"Total Video Edited"}
                          />
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-white text-[16px] w-[50%] flex justify-center items-center">
                  No editors in this workspace
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Contribution;
