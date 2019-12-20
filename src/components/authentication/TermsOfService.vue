<template>
  <div id="terms-of-service">
    <div class="terms-of-service-container">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Sagittis orci a scelerisque purus semper eget. Urna duis convallis convallis tellus id interdum velit laoreet. Arcu risus quis varius quam quisque id. Egestas pretium aenean pharetra magna ac placerat vestibulum lectus mauris. Neque vitae tempus quam pellentesque. Ultricies lacus sed turpis tincidunt id aliquet risus feugiat. Viverra aliquet eget sit amet tellus cras adipiscing enim eu. A cras semper auctor neque vitae tempus quam. Venenatis lectus magna fringilla urna porttitor rhoncus dolor purus.

      Diam sollicitudin tempor id eu nisl nunc. Vulputate eu scelerisque felis imperdiet proin. Nec tincidunt praesent semper feugiat nibh sed pulvinar proin. Sit amet venenatis urna cursus. Aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices sagittis. Aliquet nibh praesent tristique magna sit amet purus. Neque vitae tempus quam pellentesque. Duis ut diam quam nulla porttitor massa id neque aliquam. Neque vitae tempus quam pellentesque nec nam aliquam. Consectetur a erat nam at.

      Urna neque viverra justo nec ultrices. Suspendisse interdum consectetur libero id. Ac tortor dignissim convallis aenean et tortor. Amet venenatis urna cursus eget. Aliquet enim tortor at auctor urna nunc id cursus. Facilisis sed odio morbi quis commodo odio aenean sed. Quam adipiscing vitae proin sagittis nisl rhoncus mattis rhoncus. Scelerisque viverra mauris in aliquam sem fringilla ut morbi tincidunt. Eu facilisis sed odio morbi quis commodo odio. Placerat orci nulla pellentesque dignissim enim. Congue mauris rhoncus aenean vel elit scelerisque mauris pellentesque pulvinar. Urna duis convallis convallis tellus id. Id aliquet risus feugiat in ante metus. Semper auctor neque vitae tempus quam pellentesque nec nam aliquam. Ipsum dolor sit amet consectetur adipiscing elit ut.

      Integer eget aliquet nibh praesent tristique. Nisi vitae suscipit tellus mauris. Enim nulla aliquet porttitor lacus luctus accumsan tortor. Amet nisl suscipit adipiscing bibendum. Sollicitudin nibh sit amet commodo nulla facilisi. Pharetra magna ac placerat vestibulum lectus mauris ultrices eros. Vitae aliquet nec ullamcorper sit amet risus nullam. Ac turpis egestas integer eget aliquet nibh. Ipsum nunc aliquet bibendum enim facilisis gravida neque convallis. Diam quam nulla porttitor massa id. Vestibulum lorem sed risus ultricies tristique nulla aliquet enim tortor. Vulputate eu scelerisque felis imperdiet proin. Morbi non arcu risus quis. Malesuada nunc vel risus commodo viverra.

      Massa massa ultricies mi quis hendrerit dolor magna. Ac tincidunt vitae semper quis lectus nulla at volutpat. Amet nisl suscipit adipiscing bibendum est ultricies integer quis. Sit amet nisl purus in mollis nunc. Ornare quam viverra orci sagittis eu volutpat odio facilisis mauris. Justo nec ultrices dui sapien eget mi proin. Mollis aliquam ut porttitor leo a diam sollicitudin tempor id. Massa tincidunt nunc pulvinar sapien et. Eros donec ac odio tempor orci dapibus ultrices in. At ultrices mi tempus imperdiet nulla malesuada pellentesque elit eget. Et malesuada fames ac turpis egestas maecenas pharetra convallis. A iaculis at erat pellentesque adipiscing commodo elit at imperdiet. Sit amet porttitor eget dolor morbi non arcu risus quis.
    </div>

    <section class="agreement-footer">
      <div class="agreement-footer-container">
        <label class="container">
          <input type="checkbox" v-model="checked">
          <span class="checkmark"></span>
          I am citizen or resident of the United States
        </label>

        <button 
          class="button is-primary is-medium"
          @click="onAgreeClicked"
          :disabled="!checked">
          I agree
        </button>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
import { MutationPayload } from 'vuex'
import { Component, Vue } from 'vue-property-decorator'
import { getModule } from 'vuex-module-decorators'
import uuid4 from 'uuid'

import DrawerBlockchainStep from '../../../src/components/ui/DrawerBlockchainStep.vue'

import { DrawerBlockchainStepState } from '../../models/DrawerBlockchainStepState'

import MetamaskModule from '../../functionModules/metamask/MetamaskModule'
import EthereumModule from '../../functionModules/ethereum/EthereumModule'
import DatatrustModule from '../../functionModules/datatrust/DatatrustModule'

import AppModule from '../../vuexModules/AppModule'

import { Eventable } from '../../interfaces/Eventable'
import { Errors } from '../../util/Constants'

import '@/assets/style/components/terms-of-service.sass'

@Component
export default class TermsOfService extends Vue {
  public checked = false

  public onAgreeClicked() {
    // @ts-ignore
    this.$router.push(this.$route.query.redirectFrom)
  }
}
</script>
