"use client"
import { useState } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { AsyncFetcher } from '@/lib/fetcher';

const Contribution = ({ chartData }) => {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

    const [selectedEditors, setSelectedEditors] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(null);
    // First Pie: Workspace → Editor Count
    const workspaceData = chartData?.map((workspace) => {
        return {
            id: workspace.id,
            name: workspace.userHandle,
            value: workspace.editors.length,
            editors: workspace.editors,
        }
    });

    return (
        <div className="flex flex-row w-full justify-center p-4 border border-red-400 absolute -top-5 left-0">
            {/* Workspace Chart */}
            <div className="w-[50%] h-[280px]">
                <ResponsiveContainer width="110%" height="100%">
                    <PieChart>
                        <Pie
                            className='relative focus:outline-none border border-blue-600'
                            data={workspaceData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={35}
                            outerRadius={80}
                            label={({ name, percent, midAngle, cx, cy, outerRadius }) => {
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
                            onClick={(_, index) => {
                                AsyncFetcher({
                                    url: `api/fetch/chart?chart=2&ws=${_.id}`,
                                    cb: data => {
                                        setSelectedEditors(data?.filter(item => item.videoUploaded = Number(item.videoUploaded)))
                                    }
                                })

                            }}
                        >
                            {workspaceData?.map((_, index) => (
                                <Cell
                                    key={`cell-${index}`} fill={COLORS[index % COLORS.length]}
                                />
                            ))}
                        </Pie>


                        <Legend
                            layout="vertical"
                            verticalAlign="middle"
                            align="right"
                            iconType="square"
                            formatter={(value, entry, index) => {
                                const item = workspaceData?.find(d => d.name === value);
                                return (
                                    <span style={{ color: 'white', fontSize: 15 }}>
                                        {`${item.value} Editors`}
                                    </span>
                                );
                            }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>




            {/* Editor Chart */}
            {selectedEditors && selectedEditors.length > 0 ? (
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
                                label={({ name, percent, midAngle, cx, cy, outerRadius }) => {
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
                                    const item = selectedEditors.find((e) => e.editorName === value);
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
            )
                : selectedEditors?.length === 0 ? (
                    <p className="text-white">No editors in this workspace.</p>
                ) : null}
        </div>
    );
};

export default Contribution;
