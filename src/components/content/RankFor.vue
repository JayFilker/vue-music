<script setup>
import { useQuery } from '@tanstack/vue-query'
import { Rank,RankByNation } from '@/api/search.js'
import { useI18n } from 'vue-i18n'
import RankC from '@/components/content/RankC.vue'
const {
    data: rankUK,
    isLoading: isLoadingUK,
} = useQuery({
    queryKey: ['firstPage', 'UK'],
    queryFn: () => RankByNation('UK', 12, 'album'),
    staleTime: 5 * 60 * 1000,
})
const { t } = useI18n()
// console.log(rankUK._object.data?.tracks.items)
const {
    data: rankUSA,
    isLoading: isLoadingUSA,
} = useQuery({
    queryKey: ['firstPage', 'USA'],
    queryFn: () => RankByNation('USA', 12, 'album'),
    staleTime: 5 * 60 * 1000,
})
const {
    data: rankElectronic,
    isLoading: isLoadingElectronic,
} = useQuery({
    queryKey: ['firstPage', 'electronic'],
    queryFn: () => Rank('electronic', 12, 'album'),
    staleTime: 5 * 60 * 1000,
})
const {
    data: rank,
    isLoading: isLoadingRank,
} = useQuery({
    queryKey: ['firstPage', 'Rank'],
    queryFn: () => Rank('rank', 12, 'album'),
    staleTime: 5 * 60 * 1000,
})
const {
    data: rankJapan,
    isLoading: isLoadingJapan,
} = useQuery({
    queryKey: ['firstPage', 'Japan'],
    queryFn: () => RankByNation('Japan', 12, 'album'),
    staleTime: 5 * 60 * 1000,
})
const rankingListImgList = [
    'https://p2.music.126.net/rIi7Qzy2i2Y_1QD7cd0MYA==/109951170048506929.jpg?param=512y512',
    'https://p2.music.126.net/fhAqiflLy3eU-ldmBQByrg==/109951165613082765.jpg?param=512y512',
    'https://p2.music.126.net/rwRsVIJHQ68gglhA6TNEYA==/109951165611413732.jpg?param=512y512',
    'https://p2.music.126.net/oT-RHuPBJiD7WMoU7WG5Rw==/109951166093489621.jpg?param=512y512',
    'https://p2.music.126.net/aXUPgImt8hhf4cMUZEjP4g==/109951165611417794.jpg?param=512y512',
]
const des=[
    {
        name:"飙升榜",
        des:"刚刚更新"
    },    {
        name:"英国排行榜周榜",
        des:"每天更新"
    },    {
        name:"美国榜",
        des:"每周三更新"
    },    {
        name:"beatport全球电子舞曲排行榜",
        des:"每周三更新"
    },    {
        name:"日本Oricon榜",
        des:"每天更新"
    },
]
</script>
<template>
    <section class="section">
        <div class="section-header">
            <h2>{{ t('排行榜') }}</h2>
            <router-link to="/discover?key=排行榜" class="view-all">
                {{ t('查看全部') }}
            </router-link>
        </div>
        <div class="grid">
            <RankC
                v-for="(item,index) in [rank,rankUK,rankUSA,rankElectronic,rankJapan]"
                :key="index"
                :item="item"
                :img="rankingListImgList[index]"
                :des="des[index]"
            />
        </div>
    </section>
</template>
<style scoped>
.first-page {
    padding: 20px 0;
}
.page-title {
    font-size: 36px;
    font-weight: 700;
    color: var(--color-text);
    margin-bottom: 30px;
}
.section {
    margin-bottom: 50px;
}
.section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}
.section-header h2 {
    font-size: 24px;
    font-weight: 700;
    color: var(--color-text);
}
.view-all {
    font-size: 14px;
    color: var(--color-secondary);
    text-decoration: none;
    transition: color 0.2s;
}
.view-all:hover {
    color: var(--color-primary);
}
.loading {
    padding: 40px;
    text-align: center;
    color: var(--color-secondary);
}
.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
}
@media (max-width: 768px) {
    .grid {
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 16px;
    }
}
.artist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 24px;
}
@media (max-width: 768px) {
    .artist-grid {
        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    }
}
.artist-card {
    text-align: center;
    cursor: pointer;
    transition: transform 0.2s;
}
.artist-card:hover {
    transform: translateY(-4px);
}
.artist-cover {
    position: relative;
    aspect-ratio: 1;
    border-radius: 50%;
    overflow: hidden;
    background: var(--color-secondary-bg);
    margin-bottom: 12px;
}
.artist-cover img {
    position: relative;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 1;
}
.shade {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: transparent;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2;
    pointer-events: none;
}
.play-button {
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    backdrop-filter: blur(8px);
    background: rgba(255, 255, 255, 0.14);
    border: 1px solid rgba(255, 255, 255, 0.08);
    height: 26%;
    width: 26%;
    border-radius: 50%;
    cursor: pointer;
    transition: 0.2s;
    animation: fadeIn 0.2s ease-in;
    pointer-events: auto;
}
.play-button:hover {
    background: rgba(255, 255, 255, 0.28);
}
.play-button:active {
    transform: scale(0.94);
}
.shadow {
    position: absolute;
    top: 12px;
    height: 100%;
    width: 100%;
    filter: blur(16px) opacity(0.6);
    transform: scale(0.92, 0.96);
    z-index: -1;
    background-size: cover;
    border-radius: 50%;
    aspect-ratio: 1 / 1;
    opacity: 0;
    transition: opacity 0.3s;
}
.shadow.visible {
    opacity: 1;
}
.artist-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
</style>
