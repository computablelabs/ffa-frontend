import TaggersModule from 'modules/TaggersModule'

export default class FfaTagModule {
  public static deleteTag(taggersModule: TaggersModule, taggerKey: string, tag: string) {
    taggersModule.removeTag(`${taggerKey}:${tag}`)
  }
}
