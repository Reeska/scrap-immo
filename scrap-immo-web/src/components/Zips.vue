<template>
    <v-container class="zip-container">
        <v-text-field
                id="testing"
                class="zip-input"
                name="input-1"
                label="Zip code"
                :hide-details="true"
                v-model="zipCode"
                @keypress.enter="addZip"
        />
        <v-chip v-for="zipCode in value"
                :key="zipCode"
                close
                @input="removeZip(zipCode)">
            {{ zipCode }}
        </v-chip>
    </v-container>
</template>

<script>
    export default {
        props: ['value'],
        data() {
            return {
                zipCode: '',
            }
        },
        methods: {
            addZip() {
                this.value.push(this.zipCode)
                this.$emit('change', this.value)
                this.zipCode = ''
            },

            removeZip(zipCode) {
                this.value.splice(this.value.indexOf(zipCode))
                this.$emit('change', this.value)
            }
        }
    }
</script>

<style scoped lang="scss">
    .zip-container {
        display: flex;
        /*width: 300px;*/

        .zip-input {
        }
    }
</style>