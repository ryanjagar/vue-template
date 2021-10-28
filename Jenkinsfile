pipeline {
    agent any
    environment {
        USER_CREDENTIALS = credentials('srv-jenkins')
        NAME = "jenkins-example"
        VERSION = "${env.BUILD_ID}-${env.GIT_COMMIT}"
        IMAGE = "${NAME}:${VERSION}"
        HARBOR_URL = "10.230.5.2"
        HARBOR_PROJECT = "ai-prd-ns"
    }

    triggers {
        githubPush()
    }

    stages {
        stage('Test') {
            steps {
                sh 'echo "This is the test phase"'
            }
        }
        stage('Build and Push') {
	    steps {
                script {
                    def app = docker.build("${HARBOR_URL}/${HARBOR_PROJECT}/${NAME}:${VERSION}")
                    docker.withRegistry("https://${HARBOR_URL}", "srv-jenkins-domain") {
                        app.push()
                        app.push("latest")
                    }
                }
            }
        }

        stage('Remove unused image') {
            steps {
                sh "docker rmi ${HARBOR_URL}/${HARBOR_PROJECT}/${NAME}:${VERSION}"
            }
        }

	stage('Deploy') {

            steps {
               sh 'tkc=$(curl -XPOST -u $USER_CREDENTIALS_USR@ynet.gov.yk.ca:$USER_CREDENTIALS_PSW https://10.230.5.1/wcp/login -k -d \'{"guest_cluster_name":"ai-prd-cluster"}\' -H "Content-Type: application/json"); tkc_server=$(echo $tkc | jq -r .guest_cluster_server); tkc_session=$(echo $tkc | jq -r .session_id); kubectl config set-cluster $tkc_server --server=https://$tkc_server:6443 --insecure-skip-tls-verify=true; kubectl config set-context tkc-context-prod --cluster=$tkc_server; kubectl --context tkc-context-prod apply -f yaml/ -n jenkins-example --token=$tkc_session'
            }
        }

    }
    post {
        always {
            echo 'This will always run'
        }
        success {
            echo 'This will run only if successful'
        }
        failure {
            echo 'This will run only if failed'
        }
        unstable {
            echo 'This will run only if the run was marked as unstable'
        }
        changed {
            echo 'This will run only if the state of the Pipeline has changed'
            echo 'For example, if the Pipeline was previously failing but is now successful'
        }
    }
}
