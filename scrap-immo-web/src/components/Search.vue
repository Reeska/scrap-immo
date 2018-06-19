<template>
    <div class="hello">
        <v-container class="filter">
            <v-radio-group v-model="filter.category" :hide-details="true" :row="true" class="radio-group-bla">
                <v-radio label="All" value="all" />
                <v-radio label="Relevant" value="relevant" />
                <v-radio label="New" value="new" />
                <v-radio label="Favorites" value="favorite" />
                <v-radio label="Ignored" value="ignored" />
            </v-radio-group>
        </v-container>

        <div class="ads">
            <v-alert :value="true" type="info">
                <v-progress-circular indeterminate color="primary" v-show="loading"></v-progress-circular>
                <span v-if="filtredAds.length === 0 && !loading">No results.</span>
                <span v-else-if="!loading">{{ filtredAds.length }} items</span>
            </v-alert>

            <search-ad v-for="item in filtredAds" :key="item.id" :ad="item" @adChanged="adChanged()"/>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';
    // import sample from '../../samples/search';
    import SearchAd from './SearchAd';

    const API_URL = process.env.API_URL;

    export default {
        components: {SearchAd},
        data() {
            return {
                items: [],
                loading: false,
                filter: {
                    category: 'relevant'
                }
            }
        },
        async created() {
            this.loading = true;
            const response = await axios.get(API_URL + '/ads');

            this.items = response.data;
            this.loading = false;
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
            },

        },

        methods: {
            adChanged() {
                this.items = [...this.items]
            }
        }
    }
</script>

<style lang="scss">
    @import '../scss/variable';

    $content-with: 1240px;

    .filter {
        background-color: #efefef;
        border-radius: 10px;
        max-width: $content-with;

        .radio-group {
            padding: 0;
        }
    }

    .ads {
        margin: auto;
        display: block;
        text-align: center;
        max-width: $content-with;

        > .info {
            margin: 10px 0;
        }
    }

    .radio-group {
        > .input-group__input {
            flex-direction: row!important;
        }

        > .input-group__input > .radio.input-group {
            flex-direction: row!important;
        }
    }

    @media screen and (max-width: $mobile-width) {
        .radio-group {
            > .input-group__input {
                flex-direction: column!important;
            }

            > .input-group__input > .radio.input-group {
                flex-direction: column!important;;
            }
        }
    }
</style>
