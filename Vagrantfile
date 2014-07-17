# -*- mode: ruby -*-
# vi: set ft=ruby tabstop=2 :

BOX_URL = 'http://cloud-images.ubuntu.com/vagrant/saucy/current/saucy-server-cloudimg-amd64-vagrant-disk1.box'
MOUNT_POINT = '/home/vagrant/discussion-thingy'

Vagrant::Config.run do |config|
  config.vm.forward_port 80, 8000
  config.vm.forward_port 5000, 5000
  config.vm.box = 'saucy64'
  config.vm.box_url = BOX_URL
  config.vm.provision "shell", path: "etc/vagrant_provision.sh"
  config.vm.share_folder("vagrant-root", MOUNT_POINT, ".")
end
