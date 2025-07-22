"use client";
import { useState } from "react";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts";
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

const Contribution = ({ user, chartData }: ContributionProps) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];
  const [selectedEditors, setSelectedEditors] = useState<SelectedEditor[]>([]);

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
                    label={({
                      name,
                      percent,
                      midAngle,
                      cx,
                      cy,
                      outerRadius,
                    }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = outerRadius + 10;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text
                          x={x}
                          y={y}
                          textAnchor={x > cx ? "start" : "end"}
                          dominantBaseline="central"
                          fill="#ffffff"
                          fontSize={15}
                        >
                          {`${name} ${(percent * 100).toFixed(1)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {filteredData.map((entry, index) => (
                      <Cell
                        key={entry.id}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    iconType="square"
                    formatter={(value) => {
                      const item = filteredData.find((d) => d.name === value);
                      return (
                        <span style={{ color: "white", fontSize: 15 }}>
                          {`${item?.value} Videos`}
                        </span>
                      );
                    }}
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
                      label={({
                        name,
                        percent,
                        midAngle,
                        cx,
                        cy,
                        outerRadius,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius = outerRadius + 10;
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                            fill="#ffffff"
                            fontSize={15}
                          >
                            {`${name} ${(percent * 100).toFixed(1)}%`}
                          </text>
                        );
                      }}
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
                          },
                        });
                      }}
                    >
                      {filteredData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      iconType="square"
                      formatter={(value) => {
                        const item = filteredData.find((d) => d.name === value);
                        return (
                          <span style={{ color: "white", fontSize: 15 }}>
                            {`${item?.value} Editors`}
                          </span>
                        );
                      }}
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
                        data={selectedEditors}
                        dataKey="videoUploaded"
                        nameKey="editorName"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        labelLine={false}
                        label={({
                          name,
                          percent,
                          midAngle,
                          cx,
                          cy,
                          outerRadius,
                        }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = outerRadius + 10;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);
                          return (
                            <text
                              x={x}
                              y={y}
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              fill="#ffffff"
                              fontSize={14}
                            >
                              {`${name} ${(percent * 100).toFixed(1)}%`}
                            </text>
                          );
                        }}
                      >
                        {selectedEditors.map((entry, index) => (
                          <Cell
                            key={entry.editorId}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="square"
                        formatter={(value) => {
                          const item = selectedEditors.find(
                            (e) => e.editorName === value
                          );
                          return (
                            <span style={{ color: "white", fontSize: 14 }}>
                              {value}: {item?.videoUploaded}
                            </span>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-white">No editors in this workspace.</p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Contribution;
