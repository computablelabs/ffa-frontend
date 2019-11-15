<template>
  <section id="create-new-listing" >

    <FlashMessage
      v-for="flash in flashes"
      :key="flash.id"
      :flash="flash"/>

    <div v-if="isReady" class="container new-listing-container">
      <FileUploader />
      <transition name="create-new-listing-transition">
        <div class="metadata-container" v-if="showMetadataForm">
          <FileMetadata :viewOnly="formDisabled" />
          <button
            @click="openDrawer"
            class="start button is-medium is-primary"
            :disabled="buttonDisabled">
            Start Listing
          </button>
        </div>
      </transition>
    </div>

    <EthereumLoader v-else />
  </section>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import { MutationPayload } from 'vuex'

import FlashesModule from '../vuexModules/FlashesModule'
import AppModule from '../vuexModules/AppModule'
import UploadModule from '../vuexModules/UploadModule'
import NewListingModule from '../vuexModules/NewListingModule'
import DrawerModule, { DrawerState } from '../vuexModules/DrawerModule'

import CreateNewListingModule from '../functionModules/views/CreateNewListingModule'
import SharedModule from '../functionModules/components/SharedModule'
import EthereumModule from '../functionModules/ethereum/EthereumModule'

import { FlashType } from '../models/Flash'
import Flash from '../models/Flash'
import { ProcessStatus } from '../models/ProcessStatus'
import { DrawerClosed, CloseDrawer, MetamaskAccountChanged } from '../models/Events'

import FileHelper from '../util/FileHelper'

import FlashMessage from '@/components/ui/FlashMessage.vue'
import EthereumLoader from '@/components/ui/EthereumLoader.vue'
import Status from '@/components/ui/Status.vue'
import FileUploader from '@/components/listing/FileUploader.vue'
import FileMetadata from '@/components/listing/FileMetadata.vue'

import Dropzone from 'dropzone'

import '@/assets/style/views/create-new-listing.sass'

@Component({
   components: {
    FlashMessage,
    FileUploader,
    FileMetadata,
    EthereumLoader,
  },
})
export default class CreateNewListing extends Vue {

  @Prop({ default: false })
  public requiresWeb3?: boolean

  @Prop({ default: false })
  public requiresMetamask?: boolean

  @Prop({ default: false })
  public requiresParameters?: boolean

  private get flashes() {
    return this.flashesModule.flashes
  }

  private get isReady(): boolean {
    return SharedModule.isReady(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store,
      )
  }

  private get showMetadataForm(): boolean {
    return this.uploadModule.file !== FileHelper.EmptyFile
  }

  get formDisabled() {
    return this.drawerModule.status === DrawerState.processing
  }

  get buttonDisabled() {
    return !CreateNewListingModule.isValid(this.$store) ||
      this.drawerModule.status === DrawerState.processing
  }

  private flashesModule = getModule(FlashesModule, this.$store)
  private appModule = getModule(AppModule, this.$store)
  private uploadModule = getModule(UploadModule, this.$store)
  private newListingModule = getModule(NewListingModule, this.$store)
  private drawerModule = getModule(DrawerModule, this.$store)

  private created() {

    if (!this.$router.currentRoute.redirectedFrom) {
      const resolved = this.$router.resolve({name: 'createNewListing'})
      if (this.$router.currentRoute.name !== resolved.route.name) {
        this.$router.push(resolved.location)
      }
    }

    this.$root.$on(DrawerClosed, this.drawerClosed)
    this.$root.$on(MetamaskAccountChanged, this.metamaskAccountChanged)

    EthereumModule.setEthereum(this.requiresWeb3!, this.requiresMetamask!, this.requiresParameters!,
      this.$store)

    this.$nextTick(() => {
      this.$root.$emit(
        CreateNewListingModule.emitDrawerEvent(this, this.$router.currentRoute))
    })
  }

  private mounted() {
    this.newListingModule.reset()
    this.uploadModule.reset()
    console.log('CreateNewListing mounted')
  }

  private beforeUpdate() {
    this.$root.$emit(CreateNewListingModule.emitDrawerEvent(this, this.$router.currentRoute))
  }

  private beforeDestroy() {
    this.$root.$off(DrawerClosed, this.drawerClosed)
    this.$root.$off(MetamaskAccountChanged, this.metamaskAccountChanged)
  }

  private openDrawer() {
    this.drawerModule.setDrawerState(DrawerState.processing)
    this.drawerModule.setDrawerCanClose(true)

    const resolved = this.$router.resolve({name: 'createNewListingAction'})
    if (this.$router.currentRoute.path === resolved.route.path) {
      return
    }
    this.$router.push(resolved.location)
  }

  private drawerClosed() {
    if (!this.$router.currentRoute.name!.startsWith('createNewListing')) {
      return
    }
    const resolved = this.$router.resolve({name: 'createNewListing'})
    if (this.$router.currentRoute.path === resolved.route.path) {
      return
    }
    this.$router.push(resolved.location)
  }

  private async metamaskAccountChanged() {

    if (EthereumModule.ethereumDisabled()) {
      getModule(AppModule, this.$store).reset()
    }

    await EthereumModule.setEthereum(
      this.requiresWeb3!,
      this.requiresMetamask!,
      this.requiresParameters!,
      this.$store)

    this.$forceUpdate()
  }
}
</script>
