"use client"
import { useState } from 'react'
import { toast } from 'sonner';

const ChooseWS = ({ setChosenWs, workspacesForChooseWS }) => {
    const [isSelected, setIsSelected] = useState(null)
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary px-10 border border-secondary rounded-xl w-[30vw]">
            <p className="text-xl font-semibold text-center my-5">Choose Workspace</p>

            <div className={`${!workspacesForChooseWS && 'py-3'} ${workspacesForChooseWS ? `grid ${workspacesForChooseWS.length > 2 ? 'grid-cols-3' : 'grid-cols-1'} ` : 'mb-18'} gap-6 mt-8 mb-20`}>
                {
                    !workspacesForChooseWS ?
                        <p>Loading...</p>
                        :
                        workspacesForChooseWS.length <= 0 ?
                            <p>No workspace, Join Any Workspace</p>
                            :
                            workspacesForChooseWS.map((workspace, index) => {
                                const ws = workspace[1]
                                return (
                                    <div
                                        key={index}
                                        onClick={() => setIsSelected(prev => prev?.id == ws.id ? null : ws)}
                                        className={`
                                flex items-center gap-x-4 border border-secondary py-4 px-5 rounded-xl
                                hover:scale-105 transition-all duration-300 ease-in-out group cursor-pointer
                                ${isSelected?.userHandle == ws.userHandle && 'bg-[#222224]'}
                            `}
                                    >
                                        <img
                                            src={ws.avatar}
                                            className="rounded-full w-14 h-14 object-cover"
                                            alt="Channel Avatar"
                                        />

                                        <div className={`leading-tight opacity-60 group-hover:opacity-100 group-hover:blur-0 transition-all duration-300 ${isSelected?.handle == ws.handle && 'opacity-100'}`}>
                                            <p className="text-lg font-semibold">{ws.name}</p>
                                            <p className="text-sm text-gray-500">{ws.userHandle}</p>
                                        </div>
                                    </div>
                                );
                            })
                }
            </div>

            <div
                onClick={_ => {
                    if (!isSelected) toast.warning('Please Select Any Workspace')
                    setChosenWs(isSelected)
                }
                }
                className='bg-white text-black w-max py-1 px-4 rounded-sm text-lg font-semibold absolute bottom-5 right-5'>Next</div>
        </div >
    )
}

export default ChooseWS

const channels = [
    {
        id: 1,
        avatar: "https://i.ytimg.com/vi/VFJOwFBgFRI/hq720.jpg",
        name: "Harshil",
        handle: "@harshiile"
    },
];
