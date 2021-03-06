G.MyGameResources = (function (AtlasResourceHelper, DeviceInfo, userAgent, resolveAtlasPaths, File, width, height,
    addFontToDOM, URL, UI, SoundSpriteManager) {
    "use strict";

    // your files
    var scenes, world, atlases = [], font, audioInfo;

    function registerFiles(resourceLoader) {
        // add your files to the resource loader for downloading
        var isMobile = new DeviceInfo(userAgent, 1, 1, 1).isMobile;
        AtlasResourceHelper.register(resourceLoader, atlases, isMobile, resolveAtlasPaths);

        audioInfo = resourceLoader.addJSON(File.AUDIO_INFO);
        scenes = resourceLoader.addJSON(File.SCENES);
        world = resourceLoader.addJSON(File.WORLD);
        font = resourceLoader.addFont(File.GAME_FONT);

        return resourceLoader.getCount(); // number of registered files
    }

    function processFiles() {
        if (URL) {
            addFontToDOM([
                {
                    name: UI.FONT,
                    url: URL.createObjectURL(font.blob)
                }
            ]);
        }

        var sounds = new SoundSpriteManager();
        sounds.load(audioInfo);

        return {
            // services created with downloaded files
            gfxCache: AtlasResourceHelper.process(atlases, width, height),
            scenes: scenes,
            world: world,
            sounds: sounds
        };
    }

    return {
        create: registerFiles,
        process: processFiles
    };
})(H5.AtlasResourceHelper, H5.Device, window.navigator.userAgent, G.resolveAtlasPaths, G.File, window.innerWidth,
    window.innerHeight, H5.addFontToDOM, window.URL || window.webkitURL, G.UI, H5.SoundSpriteManager);