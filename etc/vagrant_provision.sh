apt-get update

apt-get install -y -q npm git openjdk-7-jre-headless neo4j
ln -sf /usr/bin/nodejs /usr/local/bin/node
echo "provision finished"
