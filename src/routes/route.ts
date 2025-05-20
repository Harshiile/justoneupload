import express from 'express'

// Middleware
import { authorize } from '../middleware'

// Controllers
import { loginUser, signUpUser, logoutUser, renewAccessToken } from '../controllers/auth'
import { getVideoFromDrive, uploadOnDrive } from '../controllers/drive'
import { getWorkspaceDetails, getPendingUploadingVideos, getVideosOfWorkSpace, getWorkspacesOfUser, fetchUserOnRefresh } from '../controllers/fetch'
import { decryptLink, initialWorkspaceJoin, fetchVideoInformationFromReviewLink, generateVideoReviewLink, finalWorkspaceJoin, generateWorkspaceJoinLink } from '../controllers/extra'
import { connectYoutubeChannel, youtubeConnecterLink, pushVideoOnScheduler } from '../controllers/youtube'

const router = express.Router()

// User-Auth
router.post('/login', loginUser)
router.post('/signup', signUpUser)
router.get('/logout', logoutUser)


// Service
router.post('/workspace/join/initial/:link', authorize, initialWorkspaceJoin);
router.post('/workspace/join/final', authorize, finalWorkspaceJoin)

router.get('/generate-link/workspace/join', authorize, generateWorkspaceJoinLink)
router.post('/generate-link/video/review', authorize, generateVideoReviewLink)

router.get('/service/renew', renewAccessToken)
router.get('/decrypt-link/:link', decryptLink)


// Youtube-Service
router.get('/youtube/connecter-link', authorize, youtubeConnecterLink)
router.get('/youtube/connect/channel', authorize, connectYoutubeChannel)
router.post('/youtube/video/approval', authorize, pushVideoOnScheduler)

// Drive-Service
router.post('/drive/upload', authorize, uploadOnDrive)

// Fetcher
router.get('/get/user/workspace/videos', authorize, getVideosOfWorkSpace)
router.get('/get/user/workspaces', authorize, getWorkspacesOfUser)
router.get('/get/user/refresh', authorize, fetchUserOnRefresh)
router.get('/get/user/videos', authorize, getPendingUploadingVideos)

router.get('/get/file-stream', authorize, getVideoFromDrive)

router.get('/get/workspace/metadata/:link', authorize, getWorkspaceDetails)
router.get('/get/video/metadata/:link', authorize, fetchVideoInformationFromReviewLink)



export default router