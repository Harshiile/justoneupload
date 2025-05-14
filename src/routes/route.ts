import { Router, Response, Request } from 'express'
import { SendMail } from '../controllers/mail'
import { authorize } from '../middleware/authorize'
import { loginUser, signUser, logoutUser } from '../controllers/auth'
import { uploadOnYoutube, youtubeChannelInfo, youtubeConnecterURL } from '../controllers/youtube'
import { deleteOnDrive, uploadOnDrive } from '../controllers/drive'
import { getVideosFromWorkSpace } from '../controllers/fetch/video'
import { getWorkSpaces } from '../controllers/fetch/workspace'
import { joinWorkSpace, wsLinkGenerate } from '../controllers/service/joinWs'
import { editorContribution } from '../controllers/fetch/analytics'

const router: Router = Router()

// User-Auth
router.post('/login', loginUser)
router.post('/signup', signUser)
router.get('/logout', logoutUser)


// Service
router.post('/service/join/workspace/:link', joinWorkSpace);
router.get('/service/generate-link', authorize, wsLinkGenerate)

// Mail-Service
router.post('/mail/send', SendMail)

// Youtube-Service
router.get('/youtube/get/oauth-url', youtubeConnecterURL)
router.get('/youtube/get/channel-info', youtubeChannelInfo)
router.post('/youtube/upload', uploadOnYoutube)

// Drive-Service
router.delete('/drive', deleteOnDrive)
router.post('/drive/upload', uploadOnDrive)

// Fetcher
router.get('/get/videos', getVideosFromWorkSpace)
router.get('/get/workspaces', getWorkSpaces)
router.get('/get/editor-contribution', editorContribution)


export default router