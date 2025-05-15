import { Router, Response, Request } from 'express'
import { SendMail } from '../controllers/mail'
import { authorize } from '../middleware/authorize'
import { loginUser, signUser, logoutUser, RenewAccessToken } from '../controllers/auth'
import { uploadOnYoutube, youtubeChannelInfo, ytConnector } from '../controllers/youtube'
import { deleteOnDrive, uploadOnDrive } from '../controllers/drive'
import { getVideosFromWorkSpace } from '../controllers/fetch/video'
import { getWorkSpaces } from '../controllers/fetch/workspace'
import { joinWorkSpace, wsLinkGenerate } from '../controllers/service/joinWs'
import { editorContribution } from '../controllers/fetch/analytics'
import { FetchMe } from '../controllers/fetch/me'

const router: Router = Router()

// User-Auth
router.post('/login', loginUser)
router.post('/signup', signUser)
router.get('/logout', logoutUser)


// Service
router.post('/service/join/workspace/:link', authorize, joinWorkSpace);
router.get('/service/generate-link', authorize, wsLinkGenerate)
router.get('/service/renew', RenewAccessToken)

// Mail-Service
router.post('/mail/send', authorize, SendMail)

// Youtube-Service
router.get('/youtube/get/oauth-url', authorize, ytConnector)
router.get('/youtube/get/channel-info', authorize, youtubeChannelInfo)
router.post('/youtube/upload', authorize, uploadOnYoutube)

// Drive-Service
router.delete('/drive', authorize, deleteOnDrive)
router.post('/drive/upload', authorize, uploadOnDrive)

// Fetcher
router.get('/get/videos', authorize, getVideosFromWorkSpace)
router.get('/get/fetch-me', authorize, FetchMe)
router.get('/get/workspaces', authorize, getWorkSpaces)
router.get('/get/editor-contribution', authorize, editorContribution)


export default router