<template>
    <div class="hello">
        <v-container class="filter">
            <v-radio-group v-model="filter.category" :row="true" :hide-details="true">
                <v-radio label="All" value="all" />
                <v-radio label="Relevant" value="relevant" />
                <v-radio label="New" value="new" />
                <v-radio label="Favorites" value="favorite" />
                <v-radio label="Ignored" value="ignored" />
            </v-radio-group>
        </v-container>

        <div class="ads">
            <search-ad v-for="item in filtredAds" :key="item.id" :ad="item"/>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    // import sample from '../../samples/search';
    import SearchAd from './SearchAd';

    export default {
        components: {SearchAd},
        data() {
            return {
                items: [],
                filter: {
                    category: 'relevant'
                }
            }
        },
        async created() {
            const response = await axios.get('http://localhost:3000/ads');

            this.items = response.data;
        },
        computed: {
            filtredAds() {
                if (this.filter.category === 'all') {
                    return this.items;
                }

                if (this.filter.category === 'relevant') {
                    return this.items.filter(ad => !ad.data.ignore);
                }

                if (this.filter.category === 'new') {
                    return this.items.filter(ad => ad.data.new);
                }

                if (this.filter.category === 'favorite') {
                    return this.items.filter(ad => ad.data.favorite);
                }

                if (this.filter.category === 'ignored') {
                    return this.items.filter(ad => ad.data.ignore);
                }
            }
        }
    }
</script>

<style scoped lang="scss">
    .filter {
        background-color: #efefef;
        border-radius: 10px;

        .radio-group {
            padding: 0;
        }
    }

    .ads {
        margin-top: 10px;
        display: block;
        text-align: center;
    }
</style>
