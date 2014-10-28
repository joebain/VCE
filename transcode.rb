#!/usr/bin/ruby

overwrite = false

sizes = [
    {:x => 1280, :y => 720},
    {:x => 854,  :y => 480},
    {:x => 428,  :y => 240},
    {:x => 320,  :y => 180}
]
formats = [
    {:v => "libx264",   :a => "copy",       :ext => "mp4",  :opts => "-profile:v baseline"},
#     {:v => "libtheora", :a => "libvorbis",  :ext => "ogg",  :opts => "-qscale:v 7"        },
    {:v => "vp8",       :a => "libvorbis",  :ext => "webm", :opts => "-b:v 1M"            }
]

files = Dir.entries "videos"
files.each do |file|
    next if (file == ".." or file == ".")
    puts "#{file}"
    formats.each do |format|
        sizes.each do |size|
            puts "  #{format[:ext]}, #{size[:x]}x#{size[:y]}"
            input = "videos/#{file}"
            output = "videos_transcoded/#{File.basename file, ".mp4"}--#{size[:y]}.#{format[:ext]}"

            next if (!overwrite and File.exists? output)

            command = "avconv #{"-y" if overwrite} -i #{input} -c:v #{format[:v]} #{format[:opts]} -c:a #{format[:a]} -s:v #{size[:x]}x#{size[:y]} #{output}" 
            puts command
            `#{command}`
        end
    end
end
    
