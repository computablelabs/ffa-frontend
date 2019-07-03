<template>
  <div class="upload">
    <!-- just some bulma layout components -->
    <div class="container">
      <div class="notification is-warning">
        <button class="delete"></button>
        Some kind of warning.
      </div>
      <div class="tile is-ancestor">
        <div class="tile is-4 is-hcentered">
          <img class="dummy-image" src="https://upload.wikimedia.org/wikipedia/en/thumb/8/86/FFA_Emblem_Feb_2015.svg/220px-FFA_Emblem_Feb_2015.svg.png">
        </div>
        <div class="tile is-vcentered">
          <h1>This is the placeholder Upload page</h1>
        </div>
      </div>
      <div class="tile is-ancestor is-hcentered">
        <div class="tile is-4 is-vcentered">
          <div class="box">
            <form action="/file-upload" class="dropzone">
              <div class="fallback">
                <input name="file" type="file" multiple />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Dropzone from 'dropzone';

Dropzone.prototype.defaultOptions.dictDefaultMessage = 'Some customized message like "Drop yo wa4r3z here"';

@Component
export default class Upload extends Vue {

  public mounted(this: Upload) {
    console.log('FOO!');
    const myDropzone = new Dropzone('.dropzone', {
      url: '/file/post',
      paramName: 'file',
      maxFiles: 1,
    });
  }
}
</script>
