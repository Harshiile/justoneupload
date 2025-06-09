"use client"
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useEffect, useRef, useState } from 'react';
import { toast } from "sonner";
import { useUser } from '@/hooks/store/user'
import { UploadCloud } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { UploaderDrawer, FileInfo, ChooseWS, Schedule, CustomCalendar, YoutuberView } from './components'
import { useRouter } from 'next/navigation';
import { AsyncFetcher } from '@/lib/fetcher';
import { socket } from "./socket"

const fadeIn = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

const Upload = () => {
    const TWO_MB_IN_BYTES = 2097152;
    const ONE_HOUR_IN_MILISECONDS = 60 * 60 * 1000;
    const navigate = useRouter();
    const [file, setFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
    const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState(null);
    const videoInputRef = useRef(null);
    const thumbnailInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [title, setTitle] = useState('');
    const [videoType, setVideoType] = useState('');
    const [duration, setDuration] = useState(null);
    const [isMadeForKids, setIsMadeForKids] = useState(null);
    const [date, setDate] = useState(null);
    const [isSchedule, setIsSchedule] = useState(false);
    const [desc, setDesc] = useState('');
    const [isThumbnail, setIsThumbnail] = useState(null);
    const [chosenWs, setChosenWs] = useState(null);
    const [workspacesForChooseWS, setWorkspacesForChooseWS] = useState(null)
    const user = useUser(state => state.user);

    useEffect(() => {
        AsyncFetcher({
            url: 'api/fetch/workspaces',
            cb: ({ workspaces }) => {
                setWorkspacesForChooseWS(Array.from(new Map(Object.entries(workspaces))))
            }
        })
        socket.connect();
        // socket.on('uploading-progress', ({ percentage }) => { console.log(percentage); setProgress(percentage) });

        socket.on('test', (test) => { console.log('Socket Test : ', test) });
        return () => socket.off('test');
    }, []);

    useEffect(() => {
        isSchedule ? setDate(new Date()) : setDate(null);
    }, [isSchedule]);

    const convertDurationIntoYTTimeFormat = (seconds) => {
        const totalSeconds = Math.floor(seconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const secs = totalSeconds % 60;
        let duration = 'PT';
        if (hours > 0) duration += hours + 'H';
        if (minutes > 0) duration += minutes + 'M';
        if (secs > 0 || (hours === 0 && minutes === 0)) duration += secs + 'S';
        return duration;
    };

    const handleVideoChange = (e) => {
        if (e.target.files?.length) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setVideoPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleThumbnailChange = (e) => {
        if (e.target.files?.length) {
            const selectedFile = e.target.files[0];
            setThumbnailFile(selectedFile);
            setThumbnailPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();

        if (!videoType) return toast.error("Type of Video is required");
        if (date && date.getTime() < Date.now() + ONE_HOUR_IN_MILISECONDS) return toast.warning("Uploading Time must be 1 hour ahead of current time");
        if (isMadeForKids == null) return toast.error("Audience Type is required");
        if (thumbnailFile && thumbnailFile.size >= TWO_MB_IN_BYTES) return toast.error("Thumbnail size must be under 2 MB");
        if (!file) return toast.error("Please select a video first");

        const formData = new FormData();
        formData.append('title', title);
        formData.append('desc', desc === '' ? null : desc);
        formData.append('duration', duration);
        formData.append('videoType', videoType);
        formData.append('isMadeForKids', isMadeForKids);
        formData.append('willUploadAt', date ? date.getTime() : null);
        formData.append('workspace', chosenWs.id);
        formData.append('video', file);
        formData.append('thumbnail', thumbnailFile);

        // setIsUploading(true);
        if (socket.id) {
            const res = await fetch(`/api/drive/upload`, {
                method: 'POST',
                body: formData,
                headers: {
                    'socket': socket.id,
                }
            })
            if (!res.ok) {
                if (res.status == 999) {
                    const renewed = await AsyncFetcher({ url: '/api//auth/renew-token' });
                    if (renewed) {
                        // Original Request
                        handleUpload(e)
                    } else toast.error('Please Login Again')
                }
            }
            else {
                const resJson = await res.json()
                console.log(resJson)
                // setIsUploading(false);
                toast.success(resJson.message);
                // navigate.push('/dashboard')
            }
        } else {
            console.log('Wait for socket initialized');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.5 }}
            className={`w-full h-full bg-primary text-[#e3e3e3] shadow-xl flex flex-col overflow-y-auto ${user.userType != 'youtuber' && 'px-8'}`}
        >
            {user.userType === 'youtuber' ? (
                <YoutuberView />
            ) :
                !chosenWs ?
                    <ChooseWS setChosenWs={setChosenWs} workspacesForChooseWS={workspacesForChooseWS} />
                    :
                    <>
                        <div className='flex justify-center items-center mb-6 gap-x-4'>
                            <motion.p
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.4 }}
                                className='text-2xl font-semibold text-center py-3 tracking-tight select-none'
                            >
                                Upload Video on
                            </motion.p>
                            <div className='flex gap-x-3 items-center'>
                                <img src={chosenWs.avatar} className='w-10 h-10 rounded-full' />
                                <p>{chosenWs.userHandle}</p>
                            </div>
                        </div>

                        <div className='flex gap-12'>

                            {/* Left Section - Form */}
                            <ScrollArea className="flex flex-col gap-y-6 flex-1">
                                <form
                                    formEncType="multipart/form-data"
                                    onSubmit={handleUpload}
                                    className='flex flex-col gap-y-8 scroll-auto'
                                >
                                    <motion.div
                                        variants={fadeIn}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        className='flex flex-col gap-y-6'
                                    >
                                        <div>
                                            <Label htmlFor='title' className='text-md mb-2'>Title</Label>
                                            <Input
                                                id='title'
                                                className='border border-secondary bg-transparent transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                placeholder='Video Title'
                                                value={title}
                                                onChange={e => setTitle(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor='desc' className='text-md mb-2'>Description</Label>
                                            <Textarea
                                                id='desc'
                                                className='border border-secondary max-w-[40vw] min-h-[120px] w-full resize-y rounded-md p-2 bg-transparent transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                                placeholder='Video Description'
                                                value={desc}
                                                onChange={e => setDesc(e.target.value)}
                                            />
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="scheduleOfUploading"
                                                className='data-[state=unchecked]:bg-secondary data-[state=checked]:bg-green-500 transition'
                                                checked={isSchedule}
                                                onCheckedChange={setIsSchedule}
                                            />
                                            <Label htmlFor="scheduleOfUploading" className='text-md select-none'>Schedule Of Uploading</Label>
                                        </div>

                                        {isSchedule && (
                                            <div>
                                                <Label htmlFor='schedule' className='text-md mb-2'>Schedule</Label>
                                                <Schedule id='schedule' date={date} setDate={setDate} />
                                            </div>
                                        )}

                                        <div>
                                            <Label htmlFor='videoType' className='text-md mb-2'>Video Type</Label>
                                            <Select id="videoType" onValueChange={setVideoType}>
                                                <SelectTrigger className='w-full border border-secondary bg-transparent transition focus:ring-2 focus:ring-blue-500 focus:border-blue-500'>
                                                    <SelectValue placeholder='Select Type' />
                                                </SelectTrigger>
                                                <SelectContent className='bg-primary text-[#e3e3e3]'>
                                                    <SelectItem value='public'>Public</SelectItem>
                                                    <SelectItem value='private'>Private</SelectItem>
                                                    <SelectItem value='unlisted'>Unlisted</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div>
                                            <Label htmlFor='isMadeForKids' className='text-md mb-2'>Audience</Label>
                                            <RadioGroup id='isMadeForKids' className='ml-3'>
                                                <div className='flex gap-x-3'>
                                                    <RadioGroupItem
                                                        value='false'
                                                        id='notMadeForKids'
                                                        className='data-[state=checked]:bg-white transition'
                                                        onClick={() => setIsMadeForKids(false)}
                                                    />
                                                    <Label htmlFor='notMadeForKids' className='select-none'>No, Not Made For Kids</Label>
                                                </div>
                                                <div className='flex gap-x-3'>
                                                    <RadioGroupItem
                                                        value='true'
                                                        id='madeForKids'
                                                        className='data-[state=checked]:bg-white transition'
                                                        onClick={() => setIsMadeForKids(true)}
                                                    />
                                                    <Label htmlFor='madeForKids' className='select-none'>Yes, Made For Kids</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="customThumbnail"
                                                className='data-[state=unchecked]:bg-secondary data-[state=checked]:bg-green-500 transition'
                                                checked={isThumbnail}
                                                onCheckedChange={setIsThumbnail}
                                            />
                                            <Label htmlFor="customThumbnail" className='text-md select-none'>Custom Thumbnail</Label>
                                        </div>

                                        {/* Thumbnail Upload */}
                                        {isThumbnail && (
                                            <div>
                                                <Label htmlFor='thumbnail' className='text-md mb-2'>Thumbnail</Label>
                                                <input
                                                    hidden
                                                    id='thumbnail'
                                                    type='file'
                                                    accept='image/*'
                                                    ref={thumbnailInputRef}
                                                    onChange={handleThumbnailChange}
                                                />

                                                <AnimatePresence>
                                                    {!thumbnailPreviewUrl ? (
                                                        <motion.div
                                                            className='flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#3f3f46] rounded-xl cursor-pointer hover:bg-[#1f1f25] transition duration-300'
                                                            onClick={() => thumbnailInputRef.current?.click()}
                                                            variants={fadeIn}
                                                            initial='hidden'
                                                            animate='visible'
                                                            exit='exit'
                                                        >
                                                            <UploadCloud className='w-12 h-12 text-[#a1a1aa]' />
                                                            <p className='text-md text-[#d4d4d8]'>Click to upload thumbnail</p>
                                                            <p className='text-xs text-[#71717a]'>JPG, PNG, or WEBP</p>
                                                        </motion.div>
                                                    ) : (
                                                        <>
                                                            <motion.img
                                                                src={thumbnailPreviewUrl}
                                                                alt="Thumbnail preview"
                                                                className='rounded-xl border border-secondary shadow-lg max-h-[30vh] w-full object-contain'
                                                                variants={fadeIn}
                                                                initial='hidden'
                                                                animate='visible'
                                                                exit='exit'
                                                            />
                                                            <AnimatePresence>
                                                                {thumbnailFile && (
                                                                    <FileInfo
                                                                        file={thumbnailFile}
                                                                        setFile={setThumbnailFile}
                                                                        setVideoPreviewUrl={setThumbnailPreviewUrl}
                                                                        type={'thumbnail'}
                                                                    />
                                                                )}
                                                            </AnimatePresence>
                                                        </>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        )}
                                    </motion.div>
                                    <UploaderDrawer
                                        isUploading={isUploading}
                                        setIsUploading={setIsUploading}
                                        progress={progress}
                                    />
                                </form>
                            </ScrollArea>

                            <Separator orientation='vertical' className='mx-12 bg-secondary w-[2px]' />

                            {/* Right Section - Video Preview */}
                            <div className='flex flex-col gap-y-6 flex-1'>
                                <div>
                                    <Label htmlFor='file' className='text-md mb-2'>Video</Label>
                                    <input
                                        hidden
                                        id='file'
                                        type='file'
                                        accept='video/*'
                                        ref={videoInputRef}
                                        onChange={handleVideoChange}
                                    />
                                    <AnimatePresence>
                                        {!videoPreviewUrl ? (
                                            <motion.div
                                                className='flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-[#3f3f46] rounded-xl cursor-pointer hover:bg-[#1f1f25] transition duration-300'
                                                onClick={() => videoInputRef.current?.click()}
                                                variants={fadeIn}
                                                initial='hidden'
                                                animate='visible'
                                                exit='exit'
                                            >
                                                <UploadCloud className='w-12 h-12 text-[#a1a1aa]' />
                                                <p className='text-md text-[#d4d4d8]'>Click to upload video</p>
                                                <p className='text-xs text-[#71717a]'>MP4, WebM, or MOV</p>
                                            </motion.div>
                                        ) : (
                                            <motion.video
                                                src={videoPreviewUrl}
                                                controls
                                                controlsList='nodownload'
                                                disablePictureInPicture
                                                disableRemotePlayback
                                                className='rounded-xl border border-secondary shadow-lg mb-3 w-full'
                                                variants={fadeIn}
                                                initial='hidden'
                                                animate='visible'
                                                exit='exit'
                                                onLoadedData={e => setDuration(convertDurationIntoYTTimeFormat(e.target.duration))}
                                            />
                                        )}
                                    </AnimatePresence>

                                    <AnimatePresence>
                                        {file && (
                                            <FileInfo
                                                file={file}
                                                setFile={setFile}
                                                setVideoPreviewUrl={setVideoPreviewUrl}
                                                type={'video'}
                                            />
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>
                    </>
            }
        </motion.div >
    );
};

export default Upload;
