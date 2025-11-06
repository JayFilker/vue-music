import { defineStore } from 'pinia'

export const useMusicStore = defineStore('music', {
  state: () => ({
    // 歌曲管理
    songList: [{
      title: 'Song 1',
      artist: ['Artist 1', 'ddd'],
      imgPic: 'https://bpic.588ku.com/element_origin_min_pic/23/07/11/d32dabe266d10da8b21bd640a2e9b611.jpg!r650',
      song: '/music/song2.mp3',
      from: 'The Band CAMINO',
    }, {
      title: 'Song 2',
      artist: ['Artist 1', 'fff'],
      imgPic: 'https://bpic.588ku.com/element_origin_min_pic/23/07/11/d32dabe266d10da8b21bd640a2e9b611.jpg!r650',
      song: '/music/song3.mp3',
      from: 'The Band CAMINO',
    }],
    currentSongList: {},
    albumList: null,

    // 播放控制
    firstPlay: true,
    playing: [],
    isPlayingDemo: false,
    isPlayingDemoTwo: false,
    countDemo: 0,
    playingTrack: Array.from({ length: 100 }).fill(false),

    // 播放器状态
    playerDemo: {
      progress: 0,
      currentTrackDuration: 100,
    },
    volume: 0.7,
    temporaryVolume: 0,
    device: '',
    stopUpdateBar: false,

    // 播放模式
    musicList: [true, true, true, true],

    // UI状态
    showLyrics: false,
    link: false,
    badLike: false,

    // 设置
    setDemo: {
      linkMusic: 'all',
      soundQuality: '1128000',
      equipment: 'default',
      cache: true,
      limit: '',
      showTranslate: true,
      showBackGround: 'true',
      currentTime: false,
      songFontSize: '28',
      useUnblock: true,
      searchModel: 'fast-first',
      closeTime: 'ask',
      proxy: 'noProxy',
      alternativeAudioSource: '',
      useFlac: false,
      rightOne: '',
      rightTwo: '',
      rightThree: '',
      rightFour: '',
      useDiscord: false,
      showMusicK: true,
      showApple: true,
      alias: false,
      flashback: false,
      entertainment: false,
      address: '',
      port: '',
      shortcutKey: false,
    },

    // 快捷键
    active: [{
      function: '播放/暂停',
      shortKey: 'Control + P',
      allShortKey: 'Alt + Control + P',
      active: false,
      allActive: false,
    }, {
      function: '下一首',
      shortKey: 'Control + →',
      allShortKey: 'Alt + Control + →',
      active: false,
      allActive: false,
    }, {
      function: '上一首',
      shortKey: 'Control + ←',
      allShortKey: 'Alt + Control + →',
      active: false,
      allActive: false,
    }, {
      function: '增加音量',
      shortKey: 'Control + ↑',
      allShortKey: 'Alt + Control + →',
      active: false,
      allActive: false,
    }, {
      function: '减少音量',
      shortKey: 'Control + ↓',
      allShortKey: 'Alt + Control + →',
      active: false,
      allActive: false,
    }, {
      function: '喜欢歌曲',
      shortKey: 'Control + L',
      allShortKey: 'Alt + Control + →',
      active: false,
      allActive: false,
    }, {
      function: '隐藏/显示播放器',
      shortKey: 'Control + M',
      allShortKey: 'Alt + Control + →',
      active: false,
      allActive: false,
    }],

    // 其他
    idDemo: null,
    playCountDemo: null,
    imgDemo: null,
    playDemo: null,
    checkDemo: false,
    navigationRequest: { path: null, action: null },
  }),

  actions: {
    // 播放控制
    togglePlay() {
      this.isPlayingDemo = !this.isPlayingDemo
    },

    setCurrentSong(index) {
      this.countDemo = index
    },

    nextSong() {
      if (this.countDemo < this.songList.length - 1) {
        this.countDemo++
      } else {
        this.countDemo = 0
      }
    },

    prevSong() {
      if (this.countDemo > 0) {
        this.countDemo--
      } else {
        this.countDemo = this.songList.length - 1
      }
    },

    setVolume(value) {
      this.volume = value
    },

    toggleLyrics() {
      this.showLyrics = !this.showLyrics
    },

    updateProgress(progress) {
      this.playerDemo.progress = progress
    },

    setDevice(deviceId) {
      this.device = deviceId
    },

    setSongList(list) {
      this.songList = list
    },

    setCurrentSongList(list) {
      this.currentSongList = list
    },

    updateSettings(settings) {
      this.setDemo = { ...this.setDemo, ...settings }
    },
  },

  getters: {
    currentSong: (state) => {
      return state.songList[state.countDemo] || null
    },

    isPlaying: (state) => {
      return state.isPlayingDemo
    },

    currentVolume: (state) => {
      return state.volume
    },

    progress: (state) => {
      return state.playerDemo.progress
    },

    currentTrackDuration: (state) => {
      return state.playerDemo.currentTrackDuration
    },
  },
})
