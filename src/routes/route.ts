import express from 'express'

// Middleware
import { authorize } from '../middleware'

// Controllers
import { loginUser, signUser, logoutUser, RenewAccessToken } from '../controllers/auth'
import { getVideoStream, uploadOnDrive } from '../controllers/drive'
import { getVideosFromWorkSpace, fetchMe, getWorkSpaces, editorContribution, getWorkspaceDetails, getPendingUploadingVideos } from '../controllers/fetch'
import { SendMail } from '../controllers/mail'
import { fetchDataFromLink, joinWorkSpace, reviewVideoLink, wsLinkGenerate } from '../controllers/service'
import { uploadOnYoutube, youtubeChannelInfo, ytConnector } from '../controllers/youtube'

const router = express.Router()

// User-Auth
router.post('/login', loginUser)
router.post('/signup', signUser)
router.get('/logout', logoutUser)


// Service
router.post('/service/join/workspace/:link', authorize, joinWorkSpace);
router.get('/service/generate-link', authorize, wsLinkGenerate)
router.post('/service/review-video-link', reviewVideoLink)
// router.get('/service/review-video-link', authorize, reviewVideoLink)
router.get('/service/renew', RenewAccessToken)

// Mail-Service
router.post('/mail/send', authorize, SendMail)

// Youtube-Service
router.get('/youtube/get/oauth-url', authorize, ytConnector)
router.get('/youtube/get/channel-info', authorize, youtubeChannelInfo)
router.post('/youtube/upload', authorize, uploadOnYoutube)

// Drive-Service
router.post('/drive/upload', authorize, uploadOnDrive)

// Fetcher
router.get('/get/videos', authorize, getVideosFromWorkSpace)
router.get('/get/stream/file', authorize, getVideoStream)
router.get('/get/fetch-me', authorize, fetchMe)
router.get('/get/workspaces', authorize, getWorkSpaces)
router.get('/get/ws-metadata/:joinLink', authorize, getWorkspaceDetails)
router.get('/get/video-metadata/:link', authorize, fetchDataFromLink)
router.get('/get/editor-contribution', authorize, editorContribution)
router.get('/get/pending-videos', getPendingUploadingVideos)


export default router