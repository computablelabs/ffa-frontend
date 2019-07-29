import {
  Module,
  VuexModule,
  Mutation } from 'vuex-module-decorators'

@Module({ namespaced: true, name: 'taggersModule' })
export default class TaggersModule extends VuexModule {

  public taggers: {[id: string]: string[]} = {}

  @Mutation
  public resetAll() {
    this.taggers = {}
  }

  @Mutation
  public resetTagger(key: string) {
    this.taggers[key] = []
  }

  @Mutation
  public addTag(tagAndKey: string) {
    const tkArray = tagAndKey.split(':')
    if (tkArray.length !== 2) {
      return
    }
    const key = tkArray[0].trim()
    const tag = tkArray[1].trim()
    if (key.length === 0 || tag.length === 0) {
      return
    }
    if (!this.taggers[key]) {
      this.taggers[key] = []
    }
    if (this.taggers[key].indexOf(tag) > -1) {
      return
    }
    this.taggers[key].push(tag)
  }

  @Mutation
  public removeTag(tagAndKey: string) {
    const tkArray = tagAndKey.split(':')
    if (tkArray.length !== 2) {
      return
    }
    const key = tkArray[0]
    const tag = tkArray[1]
    if (!this.taggers[key] || this.taggers[key].length === 0) {
      return
    }
    this.taggers[key] = this.taggers[key].filter((t) => t !== tag)
  }

  get namespace(): string {
    return 'taggersModule'
  }
}
