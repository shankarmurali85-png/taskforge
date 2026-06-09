from rest_framework import serializers
from .models import Bid


class BidSerializer(serializers.ModelSerializer):
    freelancer_username = serializers.CharField(
        source='freelancer.username',
        read_only=True
    )

    class Meta:
        model = Bid
        fields = [
            'id',
            'project',
            'freelancer',
            'freelancer_username',
            'amount',
            'proposal',
            'status',
            'created_at',
        ]
        read_only_fields = ['freelancer', 'status', 'created_at']

    def validate_project(self, project):
        request = self.context.get('request')

        if project.status != 'open':
            raise serializers.ValidationError(
                'Bids can only be placed on open projects.'
            )

        if request and project.client_id == request.user.id:
            raise serializers.ValidationError(
                'Clients cannot bid on their own projects.'
            )

        return project

    def validate(self, attrs):
        request = self.context.get('request')
        project = attrs.get('project') or getattr(self.instance, 'project', None)

        if self.instance:
            if self.instance.freelancer_id != request.user.id:
                raise serializers.ValidationError(
                    'You can only update your own bid.'
                )

            if self.instance.status != 'pending':
                raise serializers.ValidationError(
                    'Only pending bids can be updated.'
                )

            if project and project.status != 'open':
                raise serializers.ValidationError(
                    'Bids can only be updated while the project is open.'
                )

            return attrs

        if (
            request
            and project
            and Bid.objects.filter(
                project=project,
                freelancer=request.user,
            ).exists()
        ):
            raise serializers.ValidationError(
                'You have already placed a bid on this project.'
            )

        return attrs
