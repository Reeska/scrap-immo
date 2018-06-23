<template>
    <div class="ad"
         :class="{'ignore': internalAd.data.ignore, 'favorite': internalAd.data.favorite}"
         :style="{'background-image': 'url(' + internalAd.cover + ')'}">
        <div class="flags">
            <div class="vendor" :class="internalAd.vendor">
                {{ internalAd.vendor }}
            </div>

            <div class="new" v-show="internalAd.data.new">
                New
                <i class="fas fa-check-circle" @click="setNew()"></i>
            </div>
        </div>

        <div class="tags" v-show="ad.tags.length">
            <span v-for="(tag, index) in ad.tags" :key="tag">{{ tag }} <span v-if="index < ad.tags.length-1">, </span></span>
        </div>

        <div class="comment" v-show="commentShown">
            <div class="inner">
                <textarea v-model="internalAd.data.comment" placeholder="Write a comment"></textarea>

                <div>
                    <v-btn @click="toggleComment(false)">Cancel</v-btn>
                    <v-btn color="success" @click="saveComment()">Save</v-btn>
                </div>
            </div>
        </div>

        <div class="summary">
            <div class="price">{{ internalAd.price | number }} &euro;</div>
            <div class="rooms">{{ internalAd.rooms }} rooms</div>
            <div class="space">{{ internalAd.space }} m2</div>
            <div class="space">
                {{ internalAd.floor ? internalAd.floor : 'n/a' }} floor
            </div>
            <div class="summary-primary actions">
                <i class="fas fa-ban" :class="{'enabled' : internalAd.data.ignore}" @click="setIgnore()"></i>
                <i class="fas fa-heart" :class="{'enabled' : internalAd.data.favorite}" @click="setFavorite()"></i>
                <i class="fas fa-comment" :class="{'enabled' : internalAd.data.comment}" @click="toggleComment(true)"></i>
            </div>
            <div class="summary-primary">
                <i class="fas fa-clock"></i> {{ internalAd.vendorUpdateDate | moment('DD/MM HH:mm') }}
            </div>
            <div class="summary-primary id">
                <a :href="internalAd.url">#{{ internalAd.id }}</a>
            </div>
        </div>
    </div>
</template>

<script>
    import axios from 'axios';

    const API_URL = process.env.API_URL || 'http://localhost:3000';

    export default {
        props: ['ad'],
        data() {
            return {
                internalAd: {},
                commentShown: false,
                tags: ['plaisance', 'sansAscenseur']
            }
        },
        created() {
          this.internalAd = this.ad;  
        },
        methods: {
            toggleComment(visibility) {
                this.commentShown = visibility;
            },

            saveComment() {
                this.internalAd.data.new = false;
                this.save();
                this.toggleComment(false);
            },

            setFavorite() {
                this.internalAd.data.favorite = !this.internalAd.data.favorite;
                this.internalAd.data.new = false;
                this.save();
            },

            setIgnore() {
                this.internalAd.data.ignore = !this.internalAd.data.ignore;
                this.internalAd.data.new = false;
                this.save();
            },

            setNew() {
                this.internalAd.data.new = !this.internalAd.data.new;
                this.save();
            },

            save() {
                axios.put(API_URL + '/ads/' + this.internalAd.id, this.internalAd)
                    .then(() => {
                        console.log('update ad success')
                        this.$emit('adChanged', this.internalAd)
                    })
                    .catch(error => console.log('update ad error', error));
            }
        }
    }
</script>

<style scoped lang="scss">
    @import '../scss/variable';

    .ad {
        display: inline-block;
        width: 310px;
        height: 186px;
        position: relative;
        background-size: 100% 100%;

        &.ignore {
            opacity: 0.4;
        }

        &.favorite {
            background-color: #f3212182;
        }

        .flags {
            position: absolute;
            left: 8px;
            top: 8px;
            display: flex;

            > div {
                background-color: white;
                padding: 2px 6px;
                border-radius: 6px;
                margin: 0 5px;
            }

            .vendor {
                &.pap {
                    border: 1px solid #28a5d9;
                    color: white;
                    box-shadow: 0 1px 6px 1px #28a5d9;
                    background-color: #28a5d9;
                }

                &.seloger {
                    border: 1px solid #e10034;
                    color: white;
                    box-shadow: 0 1px 6px 1px #e10034;
                    background-color: #e10034;
                }
            }

            .new {
                border: 1px solid #efb4b4;
                color: red;
                box-shadow: 0 1px 6px 1px #efb4b4;

                .fa-check-circle {
                    display: none;
                    cursor: pointer;
                }

                &:hover {
                    .fa-check-circle {
                        display: inline;
                    }
                }
            }
        }


        .tags {
            position: absolute;
            left: 8px;
            bottom: 8px;
            background-color: white;
            padding: 2px 6px;
            border-radius: 6px;
            border: 1px solid #b4b8ef;
            color: #0800ff;
            -webkit-box-shadow: 0 1px 6px 1px #efb4b4;
            box-shadow: 0 1px 6px 1px #c0b4ef;
            width: 127px;
            text-align: left;
        }

        .comment {
            position: absolute;
            background-color: #000000bd;
            bottom: 0;
            top: 0;
            left: 0;
            right: 0;
            z-index: 2;
            color: white;

            .inner {
                padding: 10px;
                text-align: center;

                textarea {
                    width: 100%;
                    height: 74px;
                }
            }
        }

        img {
            width: 310px;
            height: 145px;
        }

        .summary {
            position: absolute;
            top: 0;
            right: 0;
            height: 100%;

            text-align: left;
            z-index: 1;
            background-color: rgba(0, 0, 0, 0.46);
            color: white;
            padding-right: 10px;
            padding-left: 10px;

            > div {
                padding: 0 6px;
                border-radius: 8px;
                margin-top: 5px;
                text-align: right;

                &.price {
                    background-color: #ff000070;
                }

                &.rooms {
                    background-color: rgba(121, 0, 255, 0.44);
                }

                &.space {
                    background-color: rgba(7, 1, 255, 0.44);
                }

                &.id {
                    font-family: monospace;
                }

                &.summary-primary {
                    background-color: rgba(182, 183, 171, 0.22);
                }

                &.actions {
                    i {
                        margin: 0 10px;
                        cursor: pointer;

                        &.enabled {
                            color: #ff0707;

                            &.fa-comment {
                                color: #00ccff;
                            }
                        }

                        &:hover {
                            color: #ff8e95;

                            &.fa-comment {
                                color: #c1e5ff;
                            }
                        }
                    }
                }
            }
        }
    }

    @media screen and (max-width: 620px) {
        .ad {
            width: 100%;
            height: 200px;
        }
    }
</style>
