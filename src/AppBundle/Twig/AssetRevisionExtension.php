<?php

namespace AppBundle\Twig;

use Symfony\Component\HttpFoundation\Response;

class AssetRevisionExtension extends \Twig_Extension
{
    private $appDir;

    public function __construct($appDir)
    {
        $this->appDir = $appDir;
    }

    public function getFilters()
    {
        return [
            new \Twig_SimpleFilter('rev', array($this, 'getAssetRevision')),
        ];
    }

    public function getName()
    {
        return 'rev';
    }

    public function getAssetRevision($filename)
    {
        $manifestPath = $this->appDir . '/Resources/assets/rev-manifest.json';

        // If there is no rev-manifest.json return the asset filename with no
        // modifications.
        if (! file_exists($manifestPath)) {
            return $filename;
        }

        $paths = json_decode(file_get_contents($manifestPath), true);

        // If there is a rev-manifest.json, but the referenced filename is not
        // listed in it, throw an Exception.
        if (! isset($paths[$filename])) {
            throw new \Exception(sprintf('There is no file \'%s\' in the version manifest!', $filename));
        }

        // If the versioned file doesn't exist, but a non-versioned file does,
        // fallback to that instead.
        if (! file_exists($paths[$filename]) && file_exists($filename)) {
            return $filename;
        }

        // Return the versioned filename retrieved from rev-manifest.json.
        return $paths[$filename];
    }
}
