import TaggersModule from 'vuexModules/TaggersModule'

export default class FfaTagModule {
  public static deleteTag(taggersModule: TaggersModule, taggerKey: string, tag: string) {
    taggersModule.removeTag(`${taggerKey}:${tag}`)
  }
}
