export interface Video {
    title: string,
    desc: string,
    thumbnail: string | null,
    videoType: 'public' | 'private' | 'unlisted'
    willUploadAt: string,
    duration: string,
    isMadeForKids: boolean,
    editor: string
    workspace: string,
    status: 'reviewPending' | 'uploadPending'
}