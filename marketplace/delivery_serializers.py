from rest_framework import serializers
from .models import Bid, Delivery


class DeliverySerializer(serializers.ModelSerializer):
    freelancer_username = serializers.CharField(
        source='freelancer.username',
        read_only=True
    )

    class Meta:
        model = Delivery
        fields = [
            'id',
            'project',
            'freelancer',
            'freelancer_username',
            'work_link',
            'message',
            'submitted_at',
        ]
        read_only_fields = ['freelancer', 'submitted_at']

    def validate(self, attrs):
        request = self.context.get('request')
        project = attrs.get('project')

        if not request or not project:
            return attrs

        accepted_bid = Bid.objects.filter(
            project=project,
            freelancer=request.user,
            status='accepted',
        ).first()

        if project.status != 'in_progress':
            raise serializers.ValidationError(
                'Deliveries can only be submitted for in-progress projects.'
            )

        if not accepted_bid:
            raise serializers.ValidationError(
                'Only the freelancer with the accepted bid can submit a delivery.'
            )

        if Delivery.objects.filter(project=project, freelancer=request.user).exists():
            raise serializers.ValidationError(
                'A delivery has already been submitted for this project.'
            )

        return attrs
