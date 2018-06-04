<template>
    <div id="app">
        <v-app>
            <h1 class="display-3">Scrap <span>Immo</span></h1>
            <main>
                <search/>
            </main>
        </v-app>
    </div>
</template>

<script>
    import Search from './components/Search'

    export default {
        name: 'app',
        components: {
            Search
        }
    }
</script>

<style lang="scss">
    #app {
        font-family: 'Avenir', Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: #2c3e50;

        h1 {
            text-align: center;
            margin: 10px 0;

            span {
                color: #bb3030;
            }
        }

        a {
            color: white;
        }
    }
</style>
